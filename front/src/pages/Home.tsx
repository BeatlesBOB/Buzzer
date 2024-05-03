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
    function handleRoomCreation(payload: { room: Room; isAdmin: boolean }) {
      const { room, isAdmin } = payload;
      setRoom(room);
      setIsAdmin(isAdmin);
      if (isAdmin) {
        navigate(`admin/${room.id}`);
      } else {
        navigate(`lobby/${room.id}`);
      }
    }

    subscribe("room:create", handleRoomCreation);

    return () => {
      unSubscribe("room:create", handleRoomCreation);
    };
  }, []);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function makeDeviceWakeLocked() {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (err: any) {
        pushToast({
          title: "Whooops nan mon on savais que ça pouvais pas etre parfait",
          desc: `${err.name}, ${err.message}`,
        });
      }
    }

    makeDeviceWakeLocked();

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
        });
      }
    };
  }, []);

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
          onError={(error) => {
            pushToast({
              title:
                "Whooops nan mon on savais que ça pouvais pas etre parfait",
              desc: error.message,
            });
          }}
        />
      </Modal>
    </div>
  );
}
