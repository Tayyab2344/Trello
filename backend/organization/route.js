import express from "express";
import {
  createOrganization,
  getOrganizations,
  deleteOrganization,
  createBoardForOrg,
  updateOrganization,
} from "./controller.js";
import { authentication } from "../middleware/middleware.js";

export const orgRouter = express.Router();

orgRouter.post("/neworg", createOrganization);
orgRouter.get("/", authentication, getOrganizations);

orgRouter.delete("/:id", deleteOrganization);
orgRouter.post("/:id/boards", createBoardForOrg);
orgRouter.patch("/:id", updateOrganization);
