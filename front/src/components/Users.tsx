import { useContext } from "react";
import { Team } from "../types/interfaces";
import Button from "./Button";
import { GameContext } from "../contexts/GameContextProvider";

export interface IUsers {
  teams?: Array<Team>;
  isAdmin?: boolean;
  leaveTeam: (team: Team) => void;
  updateTeamPoint?: (team: Team, point: number) => void;
  resetTeamBuzzer?: (team: Team) => void;
  joinTeam?: (team: Team) => void;
}

export default function Users({
  isAdmin = false,
  teams = [],
  leaveTeam,
  updateTeamPoint,
  resetTeamBuzzer,
  joinTeam,
}: IUsers) {
  const { user } = useContext(GameContext);

  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto">
      {teams.map((team: Team) => {
        return (
          <li
            className="p-5 shadow-lg flex flex-wrap font-primary"
            key={team.id}
          >
            <p className="capitalize text-lg">{team.name}</p>
            <p className="mx-2">({team.users.map((u) => u.name).join(", ")})</p>
            <div className="flex flex-wrap ml-auto gap-5">
              {isAdmin && updateTeamPoint && (
                <input
                  min={0}
                  type="number"
                  value={team.point}
                  onChange={(e) => {
                    updateTeamPoint(team, parseInt(e.target.value));
                  }}
                />
              )}

              {isAdmin && resetTeamBuzzer && (
                <Button
                  label="Reset buzzer"
                  handleClick={() => resetTeamBuzzer(team)}
                />
              )}

              {!isAdmin && joinTeam && !user?.team && (
                <Button label="Join team" handleClick={() => joinTeam(team)} />
              )}

              {(user?.team === team.id || isAdmin) && leaveTeam && (
                <Button label="Jme barre" handleClick={() => leaveTeam(team)} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
