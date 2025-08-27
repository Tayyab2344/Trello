import express from "express";
import { getActivities } from "./controller.js";
import { authentication } from "../middleware/middleware.js";

export const activityRouter = express.Router();

activityRouter.get("/:orgId", getActivities);
