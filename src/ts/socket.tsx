import { createContext, useState, useEffect, ReactNode } from "react";
import io, { Socket } from "socket.io-client";

interface ISocketContext {
  socket: Socket | null;
}

type Props = {
  children: ReactNode;
};

export const SocketContext = createContext<ISocketContext | undefined>(
  undefined
);

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000/"); // Replace with your server address
    setSocket(newSocket);
    return () => {newSocket.close()};
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
