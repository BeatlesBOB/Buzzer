import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { GameContext } from "../contexts/GameContextProvider";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { Room } from "../types/interfaces";
import Title from "../components/Title";

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
      navigate(`lobby/${gameId}`);
    },
    [navigate]
  );

  useEffect(() => {
    const handleRoomCreation = (payload: { room: Room; isAdmin: boolean }) => {
      const { room, isAdmin } = payload;
      setRoom(room);
      setIsAdmin(isAdmin);
      if (isAdmin) {
        navigate(`admin/${room.id}`);
      } else {
        navigate(`lobby/${room.id}`);
      }
    };
    subscribe("room:create", handleRoomCreation);

    return () => {
      unSubscribe("room:create", handleRoomCreation);
    };
  }, [navigate, setIsAdmin, setRoom, subscribe, unSubscribe]);

  return (
    <div className="grid grid-cols-[1fr_max-content_1fr] grid-rows-3 place-content-center h-dvh relative">
      <div className="row-start-2 col-start-2 col-end-3">
        <Title />       
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
