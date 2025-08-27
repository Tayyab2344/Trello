import mongoose from "mongoose";
import Board from "./model.js";
import User from "../auth/model.js";
import { getIo } from "../sockets/socket.js";
import { logActivity } from "../activity/controller.js";

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid board ID", status: false });
    }

    const deletedBoard = await Board.findByIdAndDelete(id);

    if (!deletedBoard) {
      return res
        .status(404)
        .json({ message: "Board not found", status: false });
    }

    await logActivity({
      user: req.user?.id,
      organization: deletedBoard.organization,
      board: deletedBoard._id,
      action: "deleted board",
      details: `Deleted board ${deletedBoard.title}`,
    });

    res
      .status(200)
      .json({
        message: "Board deleted successfully",
        status: true,
        board: deletedBoard,
      });
  } catch (error) {
    console.error("Error in deleteBoard:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({
        message: "Error deleting board",
        status: false,
        error: error.message,
      });
  }
};

export const getBoardsForOrg = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid organization ID", status: false });
    }

    const boards = await Board.find({ organization: id });

    res
      .status(200)
      .json({ message: "Boards fetched successfully", status: true, boards });
  } catch (error) {
    console.error("Error in getBoardsForOrg:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({
        message: "Error fetching boards",
        status: false,
        error: error.message,
      });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid board ID", status: false });
    }

    const board = await Board.findById(id).populate(
      "organization owner members"
    );

    if (!board) {
      return res
        .status(404)
        .json({ message: "Board not found", status: false });
    }

    res
      .status(200)
      .json({ message: "Board fetched successfully", status: true, board });
  } catch (error) {
    console.error("Error in getBoardById:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({
        message: "Error fetching board",
        status: false,
        error: error.message,
      });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid board ID", status: false });
    }

    const board = await Board.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!board) {
      return res
        .status(404)
        .json({ message: "Board not found", status: false });
    }

    await logActivity({
      user: req.user?.id,
      organization: board.organization,
      board: board._id,
      action: "updated board",
      details: `Updated board ${board.title}`,
    });

    res
      .status(200)
      .json({ message: "Board updated successfully", status: true, board });
  } catch (error) {
    console.error("Error in updateBoard:", {
      message: error.message,
      stack: error.stack,
    });
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message: "Board title already exists in this organization",
          status: false,
        });
    }
    res
      .status(500)
      .json({
        message: "Error updating board",
        status: false,
        error: error.message,
      });
  }
};

export const addMemberByEmail = async (req, res) => {
  try {
    const { orgId, boardName } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid organization ID" });
    }

    const board = await Board.findOne({
      organization: orgId,
      title: boardName,
    }).populate("organization", "name");
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found with this email" });
    }

    if (board.members.includes(user._id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already a member of this board",
        });
    }

    board.members.push(user._id);
    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate("members", "name email")
      .populate("organization", "name");

    await logActivity({
      user: req.user?.id,
      organization: orgId,
      board: board._id,
      action: "added member",
      details: `Added ${user.name} (${user.email}) to board ${board.title}`,
    });

    const io = getIo();

    io.to(board._id.toString()).emit("boardNotification", {
      type: "member_added",
      message: `${user.name} has been added to ${board.title}`,
      board: {
        _id: board._id,
        title: board.title,
        organization: board.organization,
      },
      newMember: { _id: user._id, name: user.name, email: user.email },
    });

    io.to(user._id.toString()).emit("newBoardAdded", {
      board: populatedBoard,
      message: `You have been added to ${board.title} in ${board.organization.name}`,
      type: "board_access_granted",
    });

    const userSockets = await io.in(user._id.toString()).fetchSockets();
    userSockets.forEach((socket) => {
      socket.join(board._id.toString());
    });

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      board: populatedBoard,
      addedMember: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Error in addMemberByEmail:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error adding member",
        error: error.message,
      });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid board ID", status: false });
    }

    if (!memberId) {
      return res
        .status(400)
        .json({ message: "Member ID is required", status: false });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      { $pull: { members: memberId } },
      { new: true, runValidators: true }
    );

    if (!updatedBoard) {
      return res
        .status(404)
        .json({ message: "Board not found", status: false });
    }

    await logActivity({
      user: req.user?.id,
      organization: updatedBoard.organization,
      board: updatedBoard._id,
      action: "removed member",
      details: `Removed member ${memberId} from board ${updatedBoard.title}`,
    });

    res
      .status(200)
      .json({
        message: "Member removed successfully",
        status: true,
        board: updatedBoard,
      });
  } catch (error) {
    console.error("Error in removeMember:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({
        message: "Error removing member",
        status: false,
        error: error.message,
      });
  }
};

export const updateTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid board ID", status: false });
    }

    if (!title) {
      return res
        .status(400)
        .json({ message: "Title is required", status: false });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      { $set: { title } },
      { new: true, runValidators: true }
    );

    if (!updatedBoard) {
      return res
        .status(404)
        .json({ message: "Board not found", status: false });
    }

    await logActivity({
      user: req.user?.id,
      organization: updatedBoard.organization,
      board: updatedBoard._id,
      action: "updated board title",
      details: `Updated board title to ${title}`,
    });

    res
      .status(200)
      .json({
        message: "Title updated successfully",
        status: true,
        board: updatedBoard,
      });
  } catch (error) {
    console.error("Error in updateTitle:", {
      message: error.message,
      stack: error.stack,
    });
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message: "Board title already exists in this organization",
          status: false,
        });
    }
    res
      .status(500)
      .json({
        message: "Error updating title",
        status: false,
        error: error.message,
      });
  }
};

export const getBoardDetails = async (req, res) => {
  try {
    const { orgId, boardName } = req.params;

    const board = await Board.findOne({
      organization: orgId,
      title: boardName,
    }).populate("members", "name email");
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json({ board });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching board details", error: error.message });
  }
};

export const getUserBoards = async (req, res) => {
  try {
    const userId = req.user.id;

    const boards = await Board.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate("organization", "name")
      .populate("members", "name email")
      .populate("owner", "name email")
      .select("_id title image organization members owner createdAt");

    res
      .status(200)
      .json({
        message: "User boards fetched successfully",
        status: true,
        boards,
      });
  } catch (error) {
    console.error("Error in getUserBoards:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({
        message: "Error fetching user boards",
        status: false,
        error: error.message,
      });
  }
};
