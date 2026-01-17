const CHANNEL = "im_realtime_v1";
let bc = null;

export function connect() {
  if (!("BroadcastChannel" in window)) return null;
  if (!bc) bc = new BroadcastChannel(CHANNEL);
  return bc;
}

export function subscribe(onMessage) {
  const channel = connect();
  if (!channel) return () => {};

  const handler = (ev) => {
    if (ev?.data?.type === "message") onMessage(ev.data.payload);
  };

  channel.addEventListener("message", handler);
  return () => channel.removeEventListener("message", handler);
}

export function broadcastMessage(message) {
  const channel = connect();
  if (!channel) return;
  channel.postMessage({ type: "message", payload: message });
}

export function disconnect() {
  if (bc) {
    bc.close();
    bc = null;
  }
}
