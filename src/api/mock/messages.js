import { KEYS, load, save, uid, sleep } from "./storage";
import { broadcastMessage } from "./realtime";

export async function listMessages({ roomId }) {
  await sleep();
  const messages = load(KEYS.MESSAGES, []);
  return messages.filter((m) => m.roomId === roomId).sort((a, b) => a.createdAt - b.createdAt);
}

export async function sendMessage({ roomId, senderId, senderName, text }) {
  await sleep(60);

  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message cannot be empty.");

  const msg = {
    id: uid("m"),
    roomId,
    senderId,
    senderName,
    text: trimmed,
    createdAt: Date.now(),
  };

  const messages = load(KEYS.MESSAGES, []);
  messages.push(msg);
  save(KEYS.MESSAGES, messages);

  // simulate realtime delivery
  broadcastMessage(msg);

  return msg;
}
