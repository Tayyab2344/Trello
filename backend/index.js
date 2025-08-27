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
  "https://trello-fot2-git-main-tayyabs-projects-9d235f55.vercel.app";

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: [allowedOrigin, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initIo(io);

app.use(
  cors({ origin: [allowedOrigin, "http://localhost:5173"], credentials: true })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);
app.use("/api/org", orgRouter);
app.use("/api/list", listRouter);
app.use("/api/card", cardRouter);
app.use("/api/activities", activityRouter);

mongodbConnection();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  // Handle user authentication and auto-join their boards
  socket.on("authenticate", async (userId) => {
    try {
      socket.userId = userId;
      socket.join(userId); // Join user-specific room for personal notifications

      // Auto-join all boards the user is a member of
      const userBoards = await Board.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select("_id title");

      userBoards.forEach((board) => {
        socket.join(board._id.toString());
        console.log(
          `👥 User ${userId} auto-joined board: ${board.title} (${board._id})`
        );
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

  // Handle manual board joining
  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
    console.log(
      `👥 User ${socket.userId || socket.id} joined board: ${boardId}`
    );
  });

  // Handle leaving a board
  socket.on("leaveBoard", (boardId) => {
    socket.leave(boardId);
    console.log(`👋 User ${socket.userId || socket.id} left board: ${boardId}`);
  });

  // Handle general notifications
  socket.on("notify", ({ boardId, message }) => {
    console.log("📢 Notify received:", boardId, message);
    io.to(boardId).emit("boardNotification", message);
  });

  // Handle typing indicators for real-time collaboration
  socket.on("typing", ({ boardId, userName, isTyping }) => {
    socket.to(boardId).emit("userTyping", { userName, isTyping });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User ${socket.userId || socket.id} disconnected`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
