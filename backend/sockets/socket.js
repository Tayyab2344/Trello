let io;

export const initIo = (server) => {
  io = server; 
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
