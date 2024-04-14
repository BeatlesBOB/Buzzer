import { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "../contexts/SocketProvider";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { GameContext } from "../contexts/GameContextProvider";

export default function Home() {
  const socket = useContext(SocketContext);
  const { setRoom, setIsAdmin } = useContext(GameContext) ;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const createGame = () => {
    socket.emit("room:create");
  };

  const joinGame = useCallback(
    (gameId: string) => {
      navigate(`room/${gameId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:create", (payload) => {
      const room = JSON.parse(payload.room);
      setRoom(room);
      setIsAdmin(payload.isAdmin);
      navigate(`room/${room.id}`);
    });

    return () => {
      socket.off("room:create");
    };
  }, [socket, joinGame, setIsAdmin, setRoom, navigate]);

  return (
    <div className="grid grid-cols-[1fr_max-content_1fr] grid-rows-3 place-content-center h-dvh relative">
      <div className="row-start-2 col-start-2 col-end-3">
        <h1 className="pointer-events-none font-primary font-black text-shadow text-9xl drop-shadow-3xl text-center text-white">
          ENVIE DE BUZZER
        </h1>
        <div className="flex mt-1.5 gap-10 justify-center">
          <button
            onClick={createGame}
            className="font-primary font-regular underline"
          >
            Créer une partie
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="font-primary font-regular underline"
          >
            Rejoindre une partie
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <QrScanner
          onDecode={joinGame}
          onError={(error) => console.log(error?.message)}
        />
      </Modal>
    </div>
  );
}
