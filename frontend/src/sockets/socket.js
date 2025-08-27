import { io } from "socket.io-client";

const socket = io(
  "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app",
  { withCredentials: true }
);

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

export const sendTypingIndicator = (boardId, userName, isTyping) => {
  socket.emit("typing", { boardId, userName, isTyping });
};

export const sendNotification = (boardId, message, type = "general") => {
  socket.emit("notify", { boardId, message, type });
};

export default socket;
