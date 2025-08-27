import { useEffect } from "react";
import { useSelector } from "react-redux";

const AppInitializer = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && user.id) {
      console.log("✅ User authenticated:", user.name);
      // Socket functionality removed for Vercel deployment
      // Real-time features will be handled through polling or webhooks
    }
  }, [user]);

  return null;
};

export default AppInitializer;
