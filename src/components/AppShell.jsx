import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function AppShell() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "100vh" }}>
      <Sidebar />
      <div style={{ display: "grid", gridTemplateRows: "56px 1fr" }}>
        <TopBar />
        <div style={{ padding: 16, overflow: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
