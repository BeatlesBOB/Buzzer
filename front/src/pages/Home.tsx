import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { GameContext } from "../contexts/GameContextProvider";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { Room } from "../types/interfaces";

export default function Home() {
  const { setRoom, setIsAdmin } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { subscribe, dispatch, unSubscribe } = useSocket();
  const navigate = useNavigate();

  const createGame = () => {
    dispatch("room:create");
  };

  const joinGame = useCallback(
    (gameId: string) => {
      navigate(`room/${gameId}`);
    },
    [navigate]
  );

  useEffect(() => {
    subscribe("room:create", (socket, payload) => {
      const room: Room = JSON.parse(payload.room);
      setRoom(room);
      console.log(socket);
      //setIsAdmin(socket.data.isAdmin);
      navigate(`lobby/${room.id}`);
    });

    return () => {
      unSubscribe("room:create");
    };
  }, [navigate, setIsAdmin, setRoom, subscribe, unSubscribe]);

  return (
    <div className="grid grid-cols-[1fr_max-content_1fr] grid-rows-3 place-content-center h-dvh relative">
      <div className="row-start-2 col-start-2 col-end-3">
        <h1 className="pointer-events-none font-primary font-black text-shadow text-6xl 2xl:text-9xl drop-shadow-2xl 2xl:drop-shadow-3xl text-center text-white">
          ENVIE DE BUZZER
        </h1>
        <div className="flex mt-1.5 gap-10 justify-center">
          <Button handleClick={createGame} label="Créer une partie" />
          <Button
            handleClick={() => setIsOpen(true)}
            label="Rejoindre une partie"
          />
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
