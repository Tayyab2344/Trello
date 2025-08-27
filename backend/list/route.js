import express from "express";
import { authentication } from "../middleware/middleware.js";
import {
  getListsByBoard,
  updateList,
  deleteList,
  createList,
} from "./controller.js";

export const listRouter = express.Router();

listRouter.get("/:boardId/lists", getListsByBoard);
listRouter.patch("/:listId", updateList);
listRouter.delete("/:listId", deleteList);
listRouter.post("/:boardId/create", createList);
