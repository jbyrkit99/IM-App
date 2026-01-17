import { KEYS, load, save, uid, sleep } from "./storage";

export async function register({ email, password }) {
  await sleep();

  const users = load(KEYS.USERS, []);
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Account already exists for that email.");

  const newUser = {
    id: uid("u"),
    email,
    password, // mock only (backend later will hash)
    firstName: "",
    lastName: "",
  };

  users.push(newUser);
  save(KEYS.USERS, users);

  // auto-login
  const session = { token: uid("t"), userId: newUser.id };
  save(KEYS.SESSION, session);

  return { token: session.token, user: sanitize(newUser) };
}

export async function login({ email, password }) {
  await sleep();

  const users = load(KEYS.USERS, []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) throw new Error("No account found for that email.");
  if (user.password !== password) throw new Error("Incorrect password.");

  const session = { token: uid("t"), userId: user.id };
  save(KEYS.SESSION, session);

  return { token: session.token, user: sanitize(user) };
}

export async function logout() {
  await sleep(80);
  localStorage.removeItem(KEYS.SESSION);
  return true;
}

export async function getSession() {
  await sleep(80);
  const session = load(KEYS.SESSION, null);
  if (!session) return null;

  const users = load(KEYS.USERS, []);
  const user = users.find((u) => u.id === session.userId);
  if (!user) return null;

  return { token: session.token, user: sanitize(user) };
}

export async function updateProfile({ userId, firstName, lastName }) {
  await sleep();

  const users = load(KEYS.USERS, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("User not found.");

  users[idx] = { ...users[idx], firstName, lastName };
  save(KEYS.USERS, users);

  return sanitize(users[idx]);
}

function sanitize(u) {
  return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName };
}
