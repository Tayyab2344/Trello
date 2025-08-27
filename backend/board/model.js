import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

boardSchema.index({ title: 1, organization: 1 }, { unique: true });

const Board = mongoose.model("Board", boardSchema);
export default Board;
