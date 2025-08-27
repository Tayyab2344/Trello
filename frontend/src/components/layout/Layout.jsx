import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../navbar/Header";
import Sidebar from "../sidebar/Sidebar";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import Overview from "@/pages/Overview";
import Members from "@/pages/Members";
import Activities from "../../pages/Activities";
import Board from "@/pages/Board";
import BoardPage from "@/pages/BoardPage";
import { Toaster } from "react-hot-toast"; // ✅ import toaster

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* ✅ Toasts will now show globally */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Home with sidebar */}
        <Route
          path="/"
          element={
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 overflow-y-auto">
                <Home />
              </main>
            </div>
          }
        />

        {/* Boards with sidebar */}
        <Route
          path="/org/:orgId/boards"
          element={
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 overflow-y-auto">
                <Board />
              </main>
            </div>
          }
        />

        {/* Overview with sidebar */}
        <Route
          path="/org/:orgId/overview"
          element={
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 overflow-y-auto">
                <Overview />
              </main>
            </div>
          }
        />

        {/* Members with sidebar */}
        <Route
          path="/org/:orgId/members"
          element={
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 overflow-y-auto">
                <Members />
              </main>
            </div>
          }
        />

        {/* Activities with sidebar */}
        <Route
          path="/org/:orgId/activities"
          element={
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 overflow-y-auto">
                <Activities />
              </main>
            </div>
          }
        />

        {/* Settings with sidebar */}
        <Route
          path="/settings"
          element={
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 overflow-y-auto">
                <Settings />
              </main>
            </div>
          }
        />

        {/* BoardPage WITHOUT sidebar (full width) */}
        <Route
          path="/board/:id"
          element={
            <main className="flex-1 p-4 overflow-y-auto">
              <BoardPage />
            </main>
          }
        />
      </Routes>
    </div>
  );
};

export default Layout;
