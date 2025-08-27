import { useEffect } from "react";

const Settings = () => {
  useEffect(() => {
    document.title = "Settings | Trello";
  }, []);
  return (
    <>
      <h1>settings</h1>
    </>
  );
};

export default Settings;
