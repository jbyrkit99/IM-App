import React, { useEffect, useRef, useState } from "react";

export default function RenameRoomModal({ open, initialName, onCancel, onSave }) {
  const [name, setName] = useState(initialName || "");
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(initialName || "");
      setErr("");
      // focus next tick
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialName]);

  if (!open) return null;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setErr("Room name cannot be empty.");
      return;
    }
    onSave(trimmed);
  }

  return (
    <div
      className="modalOverlay"
      onMouseDown={(e) => {
        // click outside closes
        if (e.target.classList.contains("modalOverlay")) onCancel();
      }}
    >
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Rename Chat</h3>

        <input
          ref={inputRef}
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter") submit();
          }}
          placeholder="Enter new name"
        />

        {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}

        <div className="modalActions">
          <button className="btn" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btnPrimary" type="button" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
