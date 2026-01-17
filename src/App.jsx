import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./routes/RequireAuth.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Rooms from "./pages/Rooms.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";
import Profile from "./pages/Profile.jsx";
import AppShell from "./components/AppShell.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route
          index
          element={
            <div style={{ color: "var(--muted)", padding: "1rem" }}>
              Select a chat room from the sidebar to start chatting.
            </div>
          }
        />

        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:roomId" element={<ChatRoom />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
