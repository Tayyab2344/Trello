import { useEffect } from "react";
import { useSelector } from "react-redux";

const AppInitializer = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && user.id) {
      console.log("✅ User authenticated:", user.name);
      // Socket functionality removed for Vercel deployment
      // Real-time features will be handled through polling or webhooks

      // Prevent any cached socket connections
      if (typeof window !== "undefined" && window.io) {
        console.log("🚫 Preventing socket connection for Vercel deployment");
        delete window.io;
      }
    }
  }, [user]);

  return null;
};

export default AppInitializer;
