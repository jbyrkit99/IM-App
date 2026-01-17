const KEYS = {
  USERS: "im_users_v1",
  ROOMS: "im_rooms_v1",
  MESSAGES: "im_messages_v1",
  SESSION: "im_session_v1",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function sleep(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}

export { KEYS, load, save, uid, sleep };
