import { io } from "socket.io-client";
import { SOCKET_URL } from "./config";

// Single shared socket instance across the app.
export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
