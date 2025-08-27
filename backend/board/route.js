import express from "express";
import {
  deleteBoard,
  getBoardsForOrg,
  getBoardById,
  updateBoard,
  addMemberByEmail,
  removeMember,
  updateTitle,
  getBoardDetails,
  getUserBoards,
} from "./controller.js";
import { authentication } from "../middleware/middleware.js";

export const boardRouter = express.Router();

boardRouter.delete("/:id", authentication, deleteBoard);
boardRouter.get("/org/:id", getBoardsForOrg);
boardRouter.get("/user/boards", authentication, getUserBoards);
boardRouter.get("/:id", getBoardById);
boardRouter.put("/:id", updateBoard);
boardRouter.post("/:orgId/:boardName/members", addMemberByEmail);
boardRouter.patch("/:id/members/remove", removeMember);
boardRouter.patch("/:id/title", authentication, updateTitle);
boardRouter.get("/:orgId/:boardName", getBoardDetails);
