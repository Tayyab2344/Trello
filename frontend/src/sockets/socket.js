import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

// Enhanced board joining with authentication
export const authenticateUser = (userId) => {
  socket.emit("authenticate", userId);
};

export const joinBoards = (boards) => {
  boards.forEach((board) => {
    socket.emit("joinBoard", board._id);
  });
};

export const leaveBoard = (boardId) => {
  socket.emit("leaveBoard", boardId);
};

// Typing indicators for real-time collaboration
export const sendTypingIndicator = (boardId, userName, isTyping) => {
  socket.emit("typing", { boardId, userName, isTyping });
};

// Enhanced notification system
export const sendNotification = (boardId, message, type = "general") => {
  socket.emit("notify", { boardId, message, type });
};

export default socket;
