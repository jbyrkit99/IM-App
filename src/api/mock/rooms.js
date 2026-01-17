import { KEYS, load, save, uid, sleep } from "./storage";

export async function listRooms() {
  await sleep();
  return load(KEYS.ROOMS, []);
}

export async function createRoom({ name, userId }) {
  await sleep();

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Room name cannot be empty.");

  const rooms = load(KEYS.ROOMS, []);
  const exists = rooms.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) throw new Error("A room with that name already exists.");

  const room = { id: uid("r"), name: trimmed, createdBy: userId, createdAt: Date.now() };
  rooms.push(room);
  save(KEYS.ROOMS, rooms);

  return room;
}

export async function deleteRoom({ roomId }) {
  await sleep();

  const rooms = load(KEYS.ROOMS, []);
  save(KEYS.ROOMS, rooms.filter((r) => r.id !== roomId));

  // also delete messages for this room
  const messages = load(KEYS.MESSAGES, []);
  save(KEYS.MESSAGES, messages.filter((m) => m.roomId !== roomId));

  return true;
}

export async function renameRoom({ roomId, name }) {
  await sleep();

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Room name cannot be empty.");

  const rooms = load(KEYS.ROOMS, []);

  const exists = rooms.some(
    (r) => r.id !== roomId && r.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) throw new Error("A room with that name already exists.");

  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx < 0) throw new Error("Room not found.");

  rooms[idx] = { ...rooms[idx], name: trimmed };
  save(KEYS.ROOMS, rooms);

  return rooms[idx];
}
