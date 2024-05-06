import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { GameContext } from "../contexts/GameContextProvider";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { Room } from "../types/interfaces";
import Title from "../components/Title";
import useToasts from "../hook/useToasts";

export default function Home() {
  const { setRoom, setIsAdmin } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { subscribe, dispatch, unSubscribe } = useSocket();
  const navigate = useNavigate();
  const { pushToast } = useToasts();

  console.log(useContext(GameContext))

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
        dispatch("room:lobby", { lobby: room.id });
        navigate(`lobby/${room.id}`);
      }
    };

    subscribe("room:create", handleRoomCreation);

    return () => {
      unSubscribe("room:create", handleRoomCreation);
    };
  }, []);

  return (
    <div className="grid grid-cols-container h-dvh items-center">
      <div className="col-start-content-start col-end-content-end flex flex-col gap-10 justify-center">
        <Title />
        <div className="flex flex-wrap mt-1.5 gap-10 justify-center">
          <Button handleClick={createGame} label="Créer une partie" />
          <Button
            handleClick={() => setIsOpen(true)}
            label="Rejoindre une partie"
          />
        </div>
        {import.meta.env.DEV && (
          <form
            className="flex flex-col basis-full border-2 border-black p-5 max-w-md w-full gap-5 self-center"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              joinGame(formData.get("room")?.toString()!);
            }}
          >
            <input
              required
              placeholder="ROOM ID"
              type="text"
              className="border border-black border-1 p-2 w-full"
              name="room"
            />
            <button>Connect</button>
          </form>
        )}
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <QrScanner
          onDecode={joinGame}
          onError={(error) => {
            pushToast({
              title:
                "Whooops, nan mais on savait que ça pouvait pas être parfait",
              desc: error.message,
            });
          }}
        />
      </Modal>
    </div>
  );
}
