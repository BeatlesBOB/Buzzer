import { useContext, useEffect } from "react";
import { SocketContext } from "../contexts/SocketProvider";
import { GameContext } from "../contexts/GameProvider";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const socket = useContext(SocketContext);
  const { setRoom, setIsAdmin } = useContext(GameContext) || {};
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("room:create", (payload) => {
      const room = JSON.parse(payload.room);
      setRoom?.(room);
      setIsAdmin?.(payload.isAdmin);
      navigate(`room/${room.id}`);
    });

    return () => {
      socket.off("room:create");
    };
  }, [socket, navigate, setIsAdmin, setRoom]);

  const createGame = () => {
    socket.emit("room:create");
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-dvh relative">
      <h1 className="pointer-events-none font-primary font-black text-shadow text-9xl drop-shadow-3xl text-center text-white">
        Buzzer
      </h1>
      <div className="flex mt-1.5">
        <button
          onClick={createGame}
          className="font-primary font-regular underline"
        >
          Crée une partie
        </button>
      </div>
    </div>
  );
}
