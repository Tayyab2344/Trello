import List from "./model.js";
import Board from "../board/model.js";

export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const lastList = await List.findOne({ board: boardId }).sort("-position");

    const newList = new List({
      title,
      board: boardId,
      position: lastList ? lastList.position + 1 : 0,
    });

    await newList.save();

    res.status(201).json({ message: "List created", list: newList });
  } catch (error) {
    res.status(500).json({
      message: "Error creating list",
      error: error.message,
    });
  }
};

export const getListsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    let lists = await List.find({ board: boardId }).sort("position");

    if (lists.length === 0) {
      const defaults = [
        { title: "Todo", board: boardId, position: 0 },
        { title: "In Progress", board: boardId, position: 1 },
        { title: "Done", board: boardId, position: 2 },
      ];
      lists = await List.insertMany(defaults);
    }

    res.status(200).json({ message: "Lists fetched", lists });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching lists", error: error.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    const list = await List.findByIdAndUpdate(listId, { title }, { new: true });

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json({ message: "List updated", list });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating list", error: error.message });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await List.findByIdAndDelete(listId);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json({ message: "List deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting list", error: error.message });
  }
};
