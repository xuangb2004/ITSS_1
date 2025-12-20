import { io } from "socket.io-client";

let socket = null;

export function initSocket(serverUrl = undefined) {
  const url = serverUrl || (import.meta.env.VITE_API_URL || window.location.origin);
  // connect to backend (assumes CORS open)
  socket = io(url.replace(/\/$/, ''));
  return socket;
}

export function joinUserRoom(userId) {
  if (!socket) return;
  socket.emit('join_user_room', userId);
}

export function onNotification(cb) {
  if (!socket) return;
  socket.on('notification', (payload) => cb(payload));
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
