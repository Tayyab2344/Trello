import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
    action: {
      type: String,
      required: true, // e.g. "created board", "deleted card", "moved card"
    },
    details: {
      type: String, // extra info if needed
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
