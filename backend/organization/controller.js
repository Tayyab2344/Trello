import mongoose from "mongoose";
import Organization from "./model.js";
import Board from "../board/model.js";
import List from "../list/model.js";
import { logActivity } from "../activity/controller.js"; // ✅ import logActivity

export const createOrganization = async (req, res) => {
  try {
    const { name, owner, members } = req.body;

    if (!name || !owner) {
      return res.status(400).json({
        message: "Name and owner are required",
        status: false,
      });
    }

    const newOrg = await Organization.create({
      name,
      owner,
      members: members || [],
    });

    // ✅ Log activity
    await logActivity({
      user: owner,
      organization: newOrg._id,
      action: "created an organization",
      details: `Created organization "${name}"`,
    });

    res.status(201).json({
      message: "Organization created successfully",
      status: true,
      organization: newOrg,
    });
  } catch (error) {
    console.error("Error in createOrganization:", error);
    res.status(500).json({
      message: "Error creating organization",
      status: false,
      error: error.message,
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid organization ID",
        status: false,
      });
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({
        message: "Organization not found",
        status: false,
      });
    }

    // ✅ Log activity
    await logActivity({
      user: req.user?.id,
      organization: id,
      action: "updated organization",
      details: `Updated organization name to "${name}"`,
    });

    res.status(200).json({
      message: "Organization updated successfully",
      status: true,
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("Error in updateOrganization:", error);
    res.status(500).json({
      message: "Error updating organization",
      status: false,
      error: error.message,
    });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid organization ID",
        status: false,
      });
    }

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({
        message: "Organization not found",
        status: false,
      });
    }

    await Board.deleteMany({ organization: id });
    await Organization.findByIdAndDelete(id);

    // ✅ Log activity
    await logActivity({
      user: req.user?.id,
      organization: id,
      action: "deleted organization",
      details: `Deleted organization "${org.name}"`,
    });

    res.status(200).json({
      message: "Organization and its boards deleted successfully",
      status: true,
      organization: org,
    });
  } catch (error) {
    console.error("Error in deleteOrganization:", error);
    res.status(500).json({
      message: "Error deleting organization",
      status: false,
      error: error.message,
    });
  }
};

export const createBoardForOrg = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, owner, members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid organization ID", status: false });
    }

    if (!title || !image || !owner) {
      return res.status(400).json({
        message: "Title, image, and owner are required",
        status: false,
      });
    }

    const org = await Organization.findById(id);
    if (!org) {
      return res
        .status(404)
        .json({ message: "Organization not found", status: false });
    }

    const board = await Board.create({
      title,
      image,
      owner,
      members: members || [],
      organization: id,
    });

    org.boards.push(board._id);
    await org.save();

    const defaults = [
      { title: "Todo", board: board._id, position: 0, cards: [] },
      { title: "In Progress", board: board._id, position: 1, cards: [] },
      { title: "Done", board: board._id, position: 2, cards: [] },
    ];
    await List.insertMany(defaults);

    const updatedOrg = await Organization.findById(id)
      .populate("boards")
      .populate("members");

    // ✅ Log activity
    await logActivity({
      user: owner,
      organization: id,
      board: board._id,
      action: "created a board",
      details: `Created board "${title}" in organization "${org.name}"`,
    });

    res.status(201).json({
      message: "Board created with default lists and linked to organization",
      status: true,
      board,
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("Error in createBoardForOrg:", error);
    res.status(500).json({
      message: "Error creating board",
      status: false,
      error: error.message,
    });
  }
};

export const getOrganizations = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized - user not logged in",
        status: false,
      });
    }

    const orgs = await Organization.find({ owner: req.user.id })
      .populate("boards")
      .populate("members");

    res.status(200).json({
      message: "Organizations fetched successfully",
      status: true,
      organizations: orgs,
    });
  } catch (error) {
    console.error("Error in getOrganizations:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error fetching organizations",
      status: false,
      error: error.message,
    });
  }
};
