import React from "react";

const FIVE_MIN_MS = 5 * 60 * 1000;

export default function MessageList({ messages, myUserId }) {
  const myId = myUserId != null ? String(myUserId) : null;
  const list = messages || [];
  const lastIdx = list.length - 1;

  if (!list.length) {
    return <div className="kicker">No messages yet</div>;
  }

  return (
    <div className="messages">
      {list.map((m, idx) => {
        const senderId = m?.senderId != null ? String(m.senderId) : null;
        const mine = myId && senderId && senderId === myId;

        const prev = idx > 0 ? list[idx - 1] : null;

        const grouped =
          prev &&
          prev.senderId != null &&
          m.senderId != null &&
          String(prev.senderId) === String(m.senderId);

        const prevTime = prev?.createdAt != null ? Number(prev.createdAt) : null;
        const currTime = m?.createdAt != null ? Number(m.createdAt) : null;

        // ✅ Timestamp rules:
        // - show on first message
        // - show if gap from previous > 5 minutes
        // - always show on the last message currently displayed
        let showTime = false;
        if (currTime != null) {
          if (idx === 0) showTime = true;
          else if (idx === lastIdx) showTime = true;
          else if (prevTime != null && currTime - prevTime > FIVE_MIN_MS) showTime = true;
        }

        const timeText =
          currTime != null
            ? new Date(currTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

        return (
          <div
            key={m.id}
            className={`msgRow ${mine ? "mine" : "theirs"} ${grouped ? "grouped" : ""}`}
          >
            <div className={`msgStack ${mine ? "mine" : "theirs"}`}>
              <div className={`bubble ${mine ? "mine" : "theirs"}`}>{m.text}</div>

              {showTime ? (
                <div className={`msgMeta ${mine ? "mine" : "theirs"}`}>
                  {!mine && m.senderName ? <span>{m.senderName}</span> : null}
                  <span>{timeText}</span>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
