import { useContext } from "react";
import { Team } from "../types/interfaces";
import Button from "./Button";
import { GameContext } from "../contexts/GameContextProvider";

export interface IUsers {
  teams?: Array<Team>;
  isAdmin: boolean;
  leaveTeam: (team: Team) => void;
  updateTeamPoint?: (team: Team, point: number) => void;
  resetTeamBuzzer?: (team: Team) => void;
  joinTeam?: (team: Partial<Team>) => void;
}

export default function Users({
  isAdmin,
  teams,
  leaveTeam,
  updateTeamPoint,
  resetTeamBuzzer,
  joinTeam,
}: IUsers) {
  const { currentTeam } = useContext(GameContext);

  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto">
      {teams?.map((team: Team) => {
        return (
          <li className="p-5 shadow-lg flex font-primary" key={team.id}>
            <p className="capitalize  text-lg">{team.name}</p>
            {currentTeam.id === team.id && leaveTeam && (
              <Button label="Leave" handleClick={() => leaveTeam(team)} />
            )}
            {isAdmin && (
              <div className="flex ml-auto">
                {updateTeamPoint && (
                  <input
                    min={0}
                    type="number"
                    value={team.point}
                    onChange={(e) => {
                      updateTeamPoint(team, parseInt(e.target.value));
                    }}
                  />
                )}

                {resetTeamBuzzer && (
                  <Button
                    label="Reset buzzer"
                    handleClick={() => resetTeamBuzzer(team)}
                  />
                )}
              </div>
            )}
            {!isAdmin && joinTeam && (
              <Button label="Join team" handleClick={() => joinTeam(team)} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
