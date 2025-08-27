import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { mongodbConnection } from "./db.js";
import { authRouter } from "./auth/routes.js";
import { boardRouter } from "./board/route.js";
import { orgRouter } from "./organization/route.js";
import { listRouter } from "./list/route.js";
import { cardRouter } from "./card/route.js";
import { activityRouter } from "./activity/route.js";

dotenv.config();

const app = express();
const allowedOrigins = [/\.vercel\.app$/];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => o.test(origin))) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);
app.use("/api/org", orgRouter);
app.use("/api/list", listRouter);
app.use("/api/card", cardRouter);
app.use("/api/activities", activityRouter);

mongodbConnection();

export default app;
