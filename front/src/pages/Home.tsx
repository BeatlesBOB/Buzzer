import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrScanner } from "@yudiel/react-qr-scanner";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Title from "../components/Title";
import useGame from "../hook/useGame";
import useAction from "../hook/useAction";
import useToasts from "../hook/useToasts";
import { ERROR_TITLE } from "../lib/errors";
import { parseRoomId } from "../lib/roomLink";
import { request } from "../lib/socket";

export default function Home() {
  const { startSession } = useGame();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useToasts();
  const act = useAction();

  const createGame = async () => {
    const res = await act(request("room:create"));
    if (!res.ok) return;
    startSession(res.data.session, res.data.room);
    navigate(`/admin/${res.data.room.id}`);
  };

  const joinGame = (value: string) => {
    const roomId = parseRoomId(value);
    if (roomId) navigate(`/lobby/${roomId}`);
  };

  return (
    <div className="grid grid-cols-container h-dvh items-center">
      <div className="col-start-content-start col-end-content-end flex flex-col gap-10 justify-center">
        <Title />
        <div className="flex flex-wrap mt-1.5 gap-10 justify-center">
          <Button handleClick={createGame} label="Créer une partie" />
          <Button handleClick={() => setIsScannerOpen(true)} label="Rejoindre une partie" />
        </div>
        <form
          className="flex flex-col basis-full border-2 border-black p-5 max-w-md w-full gap-5 self-center"
          onSubmit={(e) => {
            e.preventDefault();
            joinGame(new FormData(e.currentTarget).get("room")?.toString() ?? "");
          }}
        >
          <input
            required
            placeholder="Code ou lien de la room"
            type="text"
            className="border border-black border-1 p-2 w-full"
            name="room"
          />
          <Button type="submit" label="Connect" />
        </form>
      </div>
      <Modal isOpen={isScannerOpen} setIsOpen={setIsScannerOpen}>
        <QrScanner
          onDecode={joinGame}
          onError={(error) => pushToast({ title: ERROR_TITLE, desc: error.message })}
        />
      </Modal>
    </div>
  );
}
