import clsx from "clsx";
import { useState } from "react";
import type { PublicPlayer, PublicTeam } from "../../../shared/protocol";
import Button from "./Button";

interface AdminActions {
  setScore: (team: PublicTeam, point: number) => void;
  setLocked: (team: PublicTeam, locked: boolean) => void;
  kickTeam: (team: PublicTeam) => void;
  kickPlayer: (player: PublicPlayer) => void;
}

interface PlayerActions {
  /** Absent si le joueur est déjà dans une équipe ou si on ne peut plus rejoindre. */
  joinTeam?: (team: PublicTeam) => void;
  leaveTeam: () => void;
  myTeamId?: string;
}

export type TeamListProps = { teams: PublicTeam[]; buzzingTeamId?: string } & (
  | { admin: AdminActions; player?: never }
  | { player: PlayerActions; admin?: never }
);

/** Champ de score : envoyé au blur / Entrée, pas à chaque frappe. */
function ScoreInput({ team, onCommit }: { team: PublicTeam; onCommit: (point: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    const point = Number.parseInt(draft ?? "", 10);
    if (draft !== null && Number.isInteger(point) && point !== team.point) onCommit(point);
    setDraft(null);
  };
  return (
    <input
      type="number"
      className="w-20 border-b-2 ml-2"
      value={draft ?? team.point}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

export default function TeamList({ teams, admin, player, buzzingTeamId }: TeamListProps) {
  if (teams.length === 0) {
    return <p className="py-4 font-primary text-gray-500">Pas encore d'équipe…</p>;
  }

  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto">
      {teams.map((team) => (
        <li
          key={team.id}
          className={clsx("p-5 shadow-lg grid font-primary gap-y-5", {
            "ring-4 ring-black": team.id === buzzingTeamId,
            "opacity-60": team.locked,
          })}
        >
          <div className="flex flex-col">
            <p className="capitalize text-2xl">
              {team.name} {team.locked && <span className="text-base">(bloquée)</span>}
            </p>
            <ul className="text-gray-500 flex flex-wrap gap-x-3">
              {team.players.map((p) => (
                <li key={p.id} className="flex items-center gap-1">
                  <span
                    className={clsx("inline-block w-2 h-2 rounded-full", p.connected ? "bg-green-500" : "bg-gray-300")}
                    title={p.connected ? "connecté" : "déconnecté"}
                  />
                  {p.name}
                  {admin && (
                    <button className="text-xs underline" onClick={() => admin.kickPlayer(p)}>
                      virer
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex mt-5 items-center">
              <p className="text-md text-primary">Les pountos :</p>
              {admin ? (
                <ScoreInput team={team} onCommit={(point) => admin.setScore(team, point)} />
              ) : (
                <span className="ml-2">{team.point}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            {admin && (
              <>
                <Button
                  label={team.locked ? "Débloquer le buzzer" : "Bloquer le buzzer"}
                  handleClick={() => admin.setLocked(team, !team.locked)}
                />
                <Button label="Tu sors ou jte sors" handleClick={() => admin.kickTeam(team)} />
              </>
            )}
            {player?.joinTeam && <Button label="Join team" handleClick={() => player.joinTeam!(team)} />}
            {player && player.myTeamId === team.id && <Button label="Jme barre" handleClick={player.leaveTeam} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
