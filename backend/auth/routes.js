import express from "express";
export const authRouter = express.Router();
import { signup, login } from "./controller.js";

authRouter.post("/signup", signup);
authRouter.post("/login", login);
