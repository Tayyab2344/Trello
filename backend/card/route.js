import express from "express";
import { authentication } from "../middleware/middleware.js";
import {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard,
  moveCard,
} from "./controller.js";

export const cardRouter = express.Router();

cardRouter.post("/:listId/cards", createCard);
cardRouter.get("/:listId/cards", getCardsByList);
cardRouter.patch("/:cardId", updateCard);
cardRouter.delete("/:cardId", deleteCard);
cardRouter.put("/:cardId/move", moveCard);
