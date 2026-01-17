import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useRooms } from "../contexts/RoomsProvider";
import { useMessages } from "../contexts/MessagesProvider";
import { useAuth } from "../contexts/AuthProvider";
import MessageList from "../components/MessageList.jsx";
import MessageComposer from "../components/MessageComposer.jsx";

function displayUserName(u) {
  return (
    (u?.displayName && u.displayName.trim()) ||
    ((u?.firstName || u?.lastName)
      ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
      : "") ||
    u?.email ||
    "Unknown");
}

export default function ChatRoom() {
  const { roomId } = useParams();
  const rid = String(roomId); // normalize
  const { rooms } = useRooms();
  const { user } = useAuth();

  const { messagesByRoom, sendMessage, markRoomRead, loadRoomMessages } = useMessages();

  const room = useMemo(() => {
    return rooms.find((r) => String(r.id) === rid);
  }, [rooms, rid]);

  const messages = messagesByRoom?.[rid] || [];

  const othersText = useMemo(() => {
    const members = room?.members || room?.participants || [];
    const myId = user?.id != null ? String(user.id) : null;

    const others = members.filter((m) => {
      const id = m?.id != null ? String(m.id) : null;
      if (!myId || !id) return true;
      return id !== myId;
    });

    if (!others.length) return "Just you";

    const names = others.map(displayUserName);

    // show up to 3 names, then "+N"
    const shown = names.slice(0, 3);
    const remaining = names.length - shown.length;

    return remaining > 0 ? `${shown.join(", ")} +${remaining}` : shown.join(", ");
  }, [room, user]);

  useEffect(() => {
    markRoomRead?.(rid);

    if (typeof loadRoomMessages === "function") {
      loadRoomMessages(rid);
    }
  }, [rid, loadRoomMessages, markRoomRead]);

  async function onSend(text) {
    const senderName =
      user?.displayName ||
      ((user?.firstName || user?.lastName)
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : "") ||
      user?.email;

    await sendMessage(rid, text, user ? { id: user.id, name: senderName } : null);
  }

  if (!room) return <div>Room not found.</div>;

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 12, height: "100%" }}>
      {/* Header: room name + other participants */}
      <div style={{ display: "grid", gap: 2 }}>
        <h2 style={{ margin: 0 }}>{room.name}</h2>
        <div
          className="kicker"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {othersText}
        </div>
      </div>

      <div style={{ overflow: "auto", paddingRight: 6 }}>
        {messages.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No messages yet. Send the first one!</div>
        ) : (
          <MessageList messages={messages} myUserId={user?.id} />
        )}
      </div>

      <MessageComposer onSend={onSend} />
    </div>
  );
}
