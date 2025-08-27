import Activity from "./model.js";
import Organization from "../organization/model.js";
export const logActivity = async ({
  user,
  organization,
  board,
  list,
  card,
  action,
  details,
}) => {
  try {
    await Activity.create({
      user,
      organization,
      board,
      list,
      card,
      action,
      details,
    });
  } catch (error) {
    console.error("Error logging activity:", error.message);
  }
};

export const getActivities = async (req, res) => {
  try {
    const { orgId } = req.params;

    // check if org exists
    const orgExists = await Organization.exists({ _id: orgId });
    if (!orgExists) {
      return res.status(404).json({
        message: "Organization not found",
        status: false,
        activities: [],
      });
    }

    const activities = await Activity.find({ organization: orgId })
      .populate("user", "name email")
      .populate("board", "title")
      .populate("list", "title")
      .populate("card", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Activities fetched successfully",
      status: true,
      activities,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Error fetching activities",
      status: false,
      error: error.message,
    });
  }
};
