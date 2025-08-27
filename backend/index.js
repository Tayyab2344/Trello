import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { mongodbConnection } from "./db.js";
import { authRouter } from "./auth/routes.js";
import { boardRouter } from "./board/route.js";
import { orgRouter } from "./organization/route.js";
import { listRouter } from "./list/route.js";
import { cardRouter } from "./card/route.js";
import { activityRouter } from "./activity/route.js";
import { initIo } from "./sockets/socket.js";
import Board from "./board/model.js";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = createServer(app);
const allowedOrigin =
  "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: allowedOrigin, credentials: true }));

initIo(io);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);
app.use("/api/org", orgRouter);
app.use("/api/list", listRouter);
app.use("/api/card", cardRouter);
app.use("/api/activities", activityRouter);

mongodbConnection();

io.on("connection", (socket) => {
  socket.on("authenticate", async (userId) => {
    try {
      socket.userId = userId;
      socket.join(userId);

      const userBoards = await Board.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select("_id title");

      userBoards.forEach((board) => {
        socket.join(board._id.toString());
      });

      socket.emit("authenticated", {
        message: "Successfully authenticated and joined boards",
        boardCount: userBoards.length,
      });
    } catch (error) {
      console.error("❌ Error during socket authentication:", error);
      socket.emit("authError", { message: "Authentication failed" });
    }
  });

  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
  });

  socket.on("leaveBoard", (boardId) => {
    socket.leave(boardId);
  });

  socket.on("notify", ({ boardId, message }) => {
    io.to(boardId).emit("boardNotification", message);
  });

  socket.on("typing", ({ boardId, userName, isTyping }) => {
    socket.to(boardId).emit("userTyping", { userName, isTyping });
  });

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
