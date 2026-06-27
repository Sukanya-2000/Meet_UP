import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  const token = localStorage.getItem('cybernest_token');
  if (!socket || socket.auth?.token !== token) {
    socket?.disconnect();
    const socketUrl = import.meta.env.VITE_SOCKET_URL
      || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
    socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = undefined;
};
