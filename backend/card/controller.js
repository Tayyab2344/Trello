import Card from "./model.js";
import List from "../list/model.js";

export const createCard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { listId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // ✅ Find the list to also get its board
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // ✅ Get last card for position
    const lastCard = await Card.findOne({ list: listId }).sort("-position");
    const position = lastCard ? lastCard.position + 1 : 0;

    // ✅ Create card with board reference from list
    const card = await Card.create({
      title,
      description,
      list: listId,
      board: list.board, // 👈 this fixes "board required" error
      position,
    });

    res.status(201).json({ message: "Card created", card });
  } catch (error) {
    console.error("Error creating card:", error);
    res
      .status(500)
      .json({ message: "Error creating card", error: error.message });
  }
};

export const getCardsByList = async (req, res) => {
  try {
    const { listId } = req.params;

    const cards = await Card.find({ list: listId })
      .sort("position")
      .populate("board", "title _id")
      .populate("list", "title _id");

    res.status(200).json({
      message: "Cards fetched",
      cards,
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({
      message: "Error fetching cards",
      error: error.message,
    });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description } = req.body;

    const card = await Card.findByIdAndUpdate(
      cardId,
      { title, description },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card updated", card });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating card", error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting card", error: error.message });
  }
};
export const moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { destinationListId, destinationIndex } = req.body;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const targetList = await List.findById(destinationListId);
    if (!targetList)
      return res.status(404).json({ message: "Target list not found" });

    await Card.updateMany(
      { list: destinationListId, position: { $gte: destinationIndex } },
      { $inc: { position: 1 } }
    );

    card.list = destinationListId;
    card.board = targetList.board;
    card.position = destinationIndex;
    await card.save();

    res.status(200).json({ message: "Card moved successfully", card });
  } catch (error) {
    console.error("Error moving card:", error);
    res.status(500).json({
      message: "Error moving card",
      error: error.message,
    });
  }
};
