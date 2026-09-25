import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ErrorCode } from "../../../shared/protocol";
import Countdown from "../components/Countdown";
import useGame from "../hook/useGame";
import useNow from "../hook/useNow";
import useToasts from "../hook/useToasts";
import { ERROR_MESSAGES, ERROR_TITLE } from "../lib/errors";
import { request } from "../lib/socket";

/** Refus normaux du buzzer : affichés sur le bouton, pas en toast. */
const SILENT_ERRORS: ErrorCode[] = ["FALSE_START", "PENALIZED", "TOO_LATE", "TEAM_LOCKED", "RATE_LIMITED"];

export default function Buzzer() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { room, session, me, myTeam, readyRoomId, clockOffset, forgetSession } = useGame();
  const { pushToast } = useToasts();
  const [penaltyUntil, setPenaltyUntil] = useState(0);
  const pending = useRef(false);
  const now = useNow(penaltyUntil > Date.now());

  useEffect(() => {
    if (session?.role !== "player" || session.roomId !== id) navigate(`/lobby/${id}`, { replace: true });
    else if (readyRoomId !== id) return;
    else if (!room) navigate("/", { replace: true });
    else if (!me || room.phase === "lobby") navigate(`/lobby/${id}`, { replace: true });
  }, [session, readyRoomId, room, me, id, navigate]);

  if (!room || !me || !myTeam) return <p className="p-5 font-primary">Connexion…</p>;

  // Le bouton reste actif quand le buzzer est fermé : appuyer trop tôt = faux départ côté serveur.
  const press = async () => {
    if (pending.current) return;
    pending.current = true;
    const res = await request("buzzer:press");
    pending.current = false;
    if (res.ok) return;
    if (res.retryInMs) setPenaltyUntil(Date.now() + res.retryInMs);
    if (!SILENT_ERRORS.includes(res.error)) pushToast({ title: ERROR_TITLE, desc: ERROR_MESSAGES[res.error] });
  };

  const quit = async () => {
    if (!confirm("Tu quittes ton équipe ?")) return;
    if ((await request("team:leave")).ok) forgetSession();
  };

  const buzz = room.phase === "locked" ? room.buzz : null;
  const buzzTeam = buzz && room.teams.find((t) => t.id === buzz.teamId);
  const penalized = now < penaltyUntil;

  let label: string;
  let color: string;
  if (buzz?.playerId === me.id) [label, color] = ["T'as la main !", "bg-green-500"];
  else if (buzz?.teamId === myTeam.id) [label, color] = ["Ton équipe a la main", "bg-green-300"];
  else if (buzz) [label, color] = [`${buzzTeam?.name ?? "Une équipe"} a buzzé`, "bg-gray-300"];
  else if (penalized) [label, color] = [`Faux départ ! ${Math.ceil((penaltyUntil - now) / 1000)}s`, "bg-red-400"];
  else if (myTeam.locked) [label, color] = ["Ton équipe est bloquée", "bg-gray-300"];
  else if (room.phase === "open") [label, color] = ["BUZZ !", "bg-yellow-300"];
  else [label, color] = ["Attends…", "bg-gray-300"];

  return (
    <div className="relative h-dvh w-dvw">
      <button
        className={clsx("h-full w-full flex flex-col items-center justify-center gap-4 font-primary select-none touch-manipulation", color)}
        // pointerdown réagit dès le contact (plus juste que click sur mobile) ;
        // onClick ne sert qu'au clavier (detail === 0), pour ne pas envoyer deux fois.
        onPointerDown={press}
        onClick={(e) => e.detail === 0 && press()}
        disabled={myTeam.locked && !buzz}
      >
        <span className="text-5xl md:text-8xl font-black">{label}</span>
        {buzz?.expiresAt && (
          <span className="text-3xl">
            <Countdown expiresAt={buzz.expiresAt} clockOffset={clockOffset} />
          </span>
        )}
        <span className="text-xl">
          {me.name} · {myTeam.name} · {myTeam.point} pt{myTeam.point > 1 ? "s" : ""}
        </span>
      </button>
      <button className="absolute top-3 right-3 underline font-primary" onClick={quit}>
        Quitter
      </button>
    </div>
  );
}
