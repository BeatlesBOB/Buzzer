import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import type { Phase } from "../../../shared/protocol";
import Button from "../components/Button";
import Countdown from "../components/Countdown";
import Modal from "../components/Modal";
import TeamList from "../components/TeamList";
import Title from "../components/Title";
import BuzzerSound from "../assets/sound/Buzzer.mp3";
import useGame from "../hook/useGame";
import useAction from "../hook/useAction";
import useSocketEvent from "../hook/useSocketEvent";
import { lobbyUrl } from "../lib/roomLink";
import { request } from "../lib/socket";

const audio = new Audio(BuzzerSound);

const PHASE_LABEL: Record<Phase, string> = {
  lobby: "Les équipes se forment",
  open: "Buzzer ouvert",
  locked: "Quelqu'un a buzzé",
  paused: "Buzzer fermé",
};

export default function Admin() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { room, session, readyRoomId, clockOffset, leave } = useGame();
  const act = useAction();
  const [dismissedRound, setDismissedRound] = useState<number | null>(null);

  const isMine = session?.role === "admin" && session.roomId === id;

  useEffect(() => {
    if (!isMine || (readyRoomId === id && !room)) navigate("/", { replace: true });
  }, [isMine, readyRoomId, room, id, navigate]);

  useSocketEvent("buzzer:buzzed", () => {
    audio.currentTime = 0;
    audio.play().catch(() => {}); // lecture auto bloquée tant que l'admin n'a rien cliqué
  });

  if (!room) return <p className="p-5 font-primary">Connexion…</p>;

  const buzz = room.phase === "locked" ? room.buzz : null;
  const buzzTeam = buzz && room.teams.find((t) => t.id === buzz.teamId);
  const buzzPlayer = buzzTeam?.players.find((p) => p.id === buzz?.playerId);

  const mainAction =
    room.phase === "lobby"
      ? { label: "Lancer la partie", event: "game:open" as const }
      : room.phase === "paused"
        ? { label: "Ouvrir le buzzer", event: "game:open" as const }
        : { label: "Fermer le buzzer", event: "game:pause" as const };

  const closeRoom = async () => {
    if (!confirm("Tu veux vraiment flinguer la game ?")) return;
    const res = await act(request("room:close"));
    if (res.ok) {
      leave();
      navigate("/");
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 h-dvh p-5">
        <TeamList
          teams={room.teams}
          buzzingTeamId={buzz?.teamId}
          admin={{
            setScore: (team, point) => act(request("score:set", { teamId: team.id, point })),
            setLocked: (team, locked) => act(request("team:lock", { teamId: team.id, locked })),
            kickTeam: (team) => confirm(`Virer ${team.name} ?`) && act(request("team:kick", { teamId: team.id })),
            kickPlayer: (player) =>
              confirm(`Virer ${player.name} ?`) && act(request("player:kick", { playerId: player.id })),
          }}
        />
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <Title />
          <Button variant="primary" label="Copier le lien" handleClick={() => navigator.clipboard.writeText(lobbyUrl(room.id))} />
          <QRCode value={lobbyUrl(room.id)} />
          <p className="font-primary text-xl">{PHASE_LABEL[room.phase]}</p>
          <div className="flex gap-5 flex-wrap justify-center">
            <div className="basis-full flex justify-center">
              <Button variant="primary" label={mainAction.label} handleClick={() => act(request(mainAction.event))} />
            </div>
            <Button label="Débloquer tous les buzzers" handleClick={() => act(request("buzzer:reset"))} />
            <Button
              label="Reset tous les points"
              handleClick={() => confirm("Remettre tous les scores à 0 ?") && act(request("score:reset"))}
            />
            <div className="basis-full flex justify-center">
              <Button variant="primary" label="Fermer la partie" handleClick={closeRoom} />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!buzz && dismissedRound !== buzz.round} setIsOpen={() => buzz && setDismissedRound(buzz.round)}>
        {buzz && (
          <div className="p-5 flex flex-col gap-5">
            <h1 className="font-semibold text-4xl">L'équipe : {buzzTeam?.name} a buzzé</h1>
            <h3 className="font-medium text-lg">
              {buzzPlayer?.name}
              {buzz.expiresAt && (
                <>
                  {" "}
                  — <Countdown expiresAt={buzz.expiresAt} clockOffset={clockOffset} />
                </>
              )}
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" label="Bonne réponse (+1)" handleClick={() => act(request("buzzer:judge", { correct: true }))} />
              <Button label="Mauvaise réponse" handleClick={() => act(request("buzzer:judge", { correct: false }))} />
              <Button label="Rouvrir sans juger" handleClick={() => act(request("buzzer:release"))} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
