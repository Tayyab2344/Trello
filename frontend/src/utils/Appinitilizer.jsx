import { useEffect } from "react";
import { useSelector } from "react-redux";
import socket, { authenticateUser } from "../sockets/socket";
import toast from "react-hot-toast";

const AppInitializer = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && user.id) {
      // Authenticate user with socket server
      authenticateUser(user.id);

      // Listen for authentication confirmation
      socket.on("authenticated", (data) => {
        console.log("✅ Socket authenticated:", data);
        toast.success(`Connected! Joined ${data.boardCount} boards`, {
          duration: 2000,
        });
      });

      // Listen for authentication errors
      socket.on("authError", (error) => {
        console.error("❌ Socket authentication failed:", error);
        toast.error("Connection failed", { duration: 2000 });
      });

      // Listen for new board additions
      socket.on("newBoardAdded", (data) => {
        toast.success(data.message, { duration: 4000 });
        console.log("🎉 New board access granted:", data);
      });

      // Listen for general board notifications
      socket.on("boardNotification", (notification) => {
        if (notification.type === "member_added") {
          toast.success(notification.message, { duration: 3000 });
        } else {
          toast.info(notification.message || notification, { duration: 3000 });
        }
      });

      // Listen for typing indicators
      socket.on("userTyping", ({ userName, isTyping }) => {
        // You can implement typing indicators UI here
        console.log(`${userName} is ${isTyping ? "typing" : "stopped typing"}`);
      });

      // Cleanup listeners on unmount
      return () => {
        socket.off("authenticated");
        socket.off("authError");
        socket.off("newBoardAdded");
        socket.off("boardNotification");
        socket.off("userTyping");
      };
    }
  }, [user]);

  return null;
};

export default AppInitializer;
