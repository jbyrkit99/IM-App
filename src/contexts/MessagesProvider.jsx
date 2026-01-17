import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const MessagesContext = createContext(null);

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used inside MessagesProvider");
  return ctx;
}

const LS_MESSAGES = "imapp_messagesByRoom_v1";
const LS_UNREAD = "imapp_unreadByRoom_v1";

function normRoomId(roomId) {
  return String(roomId);
}

export function MessagesProvider({ children }) {
  const [messagesByRoom, setMessagesByRoom] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_MESSAGES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [unreadByRoom, setUnreadByRoom] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_UNREAD);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_MESSAGES, JSON.stringify(messagesByRoom));
    } catch {}
  }, [messagesByRoom]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_UNREAD, JSON.stringify(unreadByRoom));
    } catch {}
  }, [unreadByRoom]);


  function getRoomMessages(roomId) {
    const id = normRoomId(roomId);
    return messagesByRoom?.[id] || [];
  }

  function getLastMessage(roomId) {
    const list = getRoomMessages(roomId);
    return list.length ? list[list.length - 1] : null;
  }

  function getUnreadCount(roomId) {
    const id = normRoomId(roomId);
    return unreadByRoom?.[id] || 0;
  }


  function markRoomRead(roomId) {
    const id = normRoomId(roomId);
    setUnreadByRoom((prev) => {
      if (!prev?.[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function clearAllUnread() {
    setUnreadByRoom({});
  }

  function addMessage(roomId, message, activeRoomId = null) {
    const id = normRoomId(roomId);
    const activeId = activeRoomId ? normRoomId(activeRoomId) : null;

    const safeMsg = {
      id: message?.id || `m_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      roomId: id,
      text: message?.text || "",
      senderId: message?.senderId,
      senderName: message?.senderName,
      createdAt:
        typeof message?.createdAt === "number" ? message.createdAt : Date.now(),
    };

    setMessagesByRoom((prev) => {
      const list = prev?.[id] || [];
      return { ...prev, [id]: [...list, safeMsg] };
    });

    if (!activeId || activeId !== id) {
      setUnreadByRoom((prev) => ({
        ...prev,
        [id]: (prev?.[id] || 0) + 1,
      }));
    }
  }

  function sendMessage(roomId, text, sender) {
  const senderName =
    sender?.displayName ||
    (sender?.firstName || sender?.lastName
      ? `${sender.firstName ?? ""} ${sender.lastName ?? ""}`.trim()
      : sender?.email);

  const msg = {
    text,
    senderId: sender?.id,
    senderName,
    createdAt: Date.now(),
  };

  addMessage(roomId, msg, roomId);
  return true;
}


  function clearRoomMessages(roomId) {
    const id = normRoomId(roomId);

    setMessagesByRoom((prev) => {
      if (!prev?.[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setUnreadByRoom((prev) => {
      if (!prev?.[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const value = useMemo(
    () => ({
      messagesByRoom,
      unreadByRoom,

      getRoomMessages,
      getLastMessage,
      getUnreadCount,

      addMessage,
      sendMessage,
      markRoomRead,
      clearRoomMessages,
      clearAllUnread,

      setMessagesByRoom,
      setUnreadByRoom,
    }),
    [messagesByRoom, unreadByRoom]
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}
