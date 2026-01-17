import React, { createContext, use, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthProvider";

const RoomsContext = createContext(null);

export function useRooms() {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error("useRooms must be used within a RoomsProvider");
  return ctx;
}

export function RoomsProvider({ children }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  async function refreshRooms() {
    setLoadingRooms(true);
    try {
      const list = await api.rooms.listRooms();
      setRooms(list);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function createRoom(name) {
    const room = await api.rooms.createRoom({ name, userId: user.id });
    await refreshRooms();
    return room;
  }

  async function deleteRoom(roomId) {
    await api.rooms.deleteRoom({ roomId });
    await refreshRooms();
  }

  useEffect(() => {
    if (user) refreshRooms();
    else setRooms([]);
  }, [user]);

  async function renameRoom(roomId, newName) {
    const updated = await api.rooms.renameRoom({ roomId, name: newName });

    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, name: newName } : r))
    );
    return updated;
  }
  const value = useMemo(
    () => ({ rooms, loadingRooms, refreshRooms, createRoom, deleteRoom, renameRoom }),
    [rooms, loadingRooms]
  );

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}


