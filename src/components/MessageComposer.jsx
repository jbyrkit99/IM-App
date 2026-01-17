import React, { useState } from "react";

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await onSend(text);
      setText("");
    } catch (ex) {
      setErr(ex.message || "Failed to send message.");
    }
  }

  return (
    <form onSubmit={submit} className="hstack">
  <input
    className="input"
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Type a message…"
  />

  <button
    type="submit"
    className="btn btnPrimary"
    disabled={!text.trim()}
  >
      Send
    </button>

    {err ? <div className="error">{err}</div> : null}
  </form>
  );
}
