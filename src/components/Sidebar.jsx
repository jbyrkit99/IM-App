import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRooms } from "../contexts/RoomsProvider";
import { useMessages } from "../contexts/MessagesProvider";

import RenameRoomModal from "./RenameRoomModal";

function ChatCard({
  room,
  active,
  preview,
  time,
  unread,
  boldPreview,
  onOpen,
  onRename,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onDocMouseDown(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    function onDocKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="chatCardWrap" ref={wrapRef}>
      <div
        className={`chatCard ${active ? "chatCardActive" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => {
          setMenuOpen(false);
          onOpen();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setMenuOpen(false);
            onOpen();
          }
        }}
      >
        <div className="chatCardTitleRow">
          <div className="chatCardTitle">{room.name}</div>

          <div className="chatCardMeta">
            {time ? <div className="chatCardTime">{time}</div> : null}

            {unread > 0 ? (
              <div className="unreadPill">{unread > 99 ? "99+" : unread}</div>
            ) : (
              <div className="unreadDotSpacer" />
            )}
          </div>
        </div>

        <div className={`chatCardPreview ${boldPreview ? "chatCardPreviewUnread" : ""}`}>
          {preview}
        </div>
      </div>

      <button
        type="button"
        className="chatCardMiniBtn"
        aria-label="Chat options"
        title="Options"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
      >
        ⋯
      </button>

      {menuOpen ? (
        <div className="roomMenu">
          <button
            type="button"
            className="roomMenuBtn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onRename();
            }}
          >
            Rename
          </button>

          <button
            type="button"
            className="roomMenuBtn roomMenuBtnDanger"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar() {
  const nav = useNavigate();
  const { roomId: activeRoomId } = useParams();

  const { rooms, createRoom, deleteRoom, renameRoom } = useRooms();
  const { getLastMessage, getUnreadCount, markRoomRead } = useMessages();

  const [query, setQuery] = useState("");
  const [err, setErr] = useState("");

  // ✅ create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // rename modal state
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameRoomId, setRenameRoomId] = useState(null);
  const [renameInitial, setRenameInitial] = useState("");

  function openCreate() {
    setErr("");
    setCreateName("");
    setCreateOpen(true);
  }

  function closeCreate() {
    setCreateOpen(false);
    setCreateName("");
  }

  async function onCreateSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!createName.trim()) {
      setErr("Chat name cannot be empty.");
      return;
    }

    try {
      const room = await createRoom(createName.trim());
      closeCreate();
      nav(`/app/rooms/${room.id}`);
    } catch (ex) {
      setErr(ex.message || "Failed to create chat.");
    }
  }

  // search filter
  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;

    return rooms.filter((room) => {
      const last = getLastMessage(room.id);
      const preview = last ? `${last.senderName || "Someone"}: ${last.text}` : "";
      return room.name.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
    });
  }, [rooms, query, getLastMessage]);

  return (
    <div className="sidebar">
      <div className="hstack" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Chats</h3>

        {/* ✅ Create button now opens modal */}
        <button className="btn btnPrimary btnSmall" type="button" onClick={openCreate}>
          + Create
        </button>
      </div>

      <input
        className="input"
        placeholder="Search chats…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginTop: 10 }}
      />

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}

      <div className="chatList">
        {filteredRooms.map((room) => {
          const last = getLastMessage(room.id);

          const preview = last ? `${last.senderName || "Someone"}: ${last.text}` : "No messages yet";

          const time = last
            ? new Date(last.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const unread = getUnreadCount(room.id);
          const active = String(room.id) === String(activeRoomId);

          return (
            <ChatCard
              key={room.id}
              room={room}
              active={active}
              preview={preview}
              time={time}
              unread={unread}
              boldPreview={unread > 0}
              onOpen={() => {
                nav(`/app/rooms/${room.id}`);
                markRoomRead(room.id);
              }}
              onRename={() => {
                setRenameRoomId(room.id);
                setRenameInitial(room.name);
                setRenameOpen(true);
              }}
              onDelete={() => deleteRoom(room.id)}
            />
          );
        })}
      </div>

      {/* ✅ Create Room Modal */}
      {createOpen ? (
        <div
          className="modalOverlay"
          onClick={() => {
            closeCreate();
          }}
        >
          <div
            className="modalCard"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modalTitle">Create chat</div>

            <form onSubmit={onCreateSubmit} className="vstack">
              <input
                className="input"
                autoFocus
                placeholder="Chat name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />

              <div className="modalActions">
                <button type="button" className="btn" onClick={closeCreate}>
                  Cancel
                </button>
                <button type="submit" className="btn btnPrimary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <RenameRoomModal
        open={renameOpen}
        initialName={renameInitial}
        onCancel={() => setRenameOpen(false)}
        onSave={async (newName) => {
          try {
            setErr("");
            await renameRoom(renameRoomId, newName);
            setRenameOpen(false);
          } catch (ex) {
            setErr(ex.message || "Failed to rename chat.");
          }
        }}
      />
    </div>
  );
}
