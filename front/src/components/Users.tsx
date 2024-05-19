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
          <li className="p-5 shadow-lg grid font-primary gap-y-5" key={team.id}>
            <div className="flex flex-col col-start-1">
              <p className="capitalize text-2xl">{team.name}</p>
              <p className="text-gray-500">
                ({team.users.map((u) => u.name).join(", ")})
              </p>
              {isAdmin && updateTeamPoint && (
                <div className="flex mt-5">
                  <p className="text-md text-primary">Les pountos :</p>
                  {
                    <input
                      min={0}
                      type="number"
                      value={team.point}
                      onChange={(e) => {
                        updateTeamPoint(team, parseInt(e.target.value));
                      }}
                    />
                  }
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-5 row-start-2 col-start-1">
              {isAdmin && resetTeamBuzzer && (
                <Button
                  label="Reset buzzer"
                  handleClick={() => resetTeamBuzzer(team)}
                />
              )}

              {!isAdmin && joinTeam && !user?.team && (
                <Button label="Join team" handleClick={() => joinTeam(team)} />
              )}

              {isAdmin && (
                <Button label="Bloquer le buzzer" handleClick={() => {}} />
              )}

              {(user?.team === team.id || isAdmin) && leaveTeam && (
                <Button
                  label={isAdmin ? "Tu sors ou jte sors" : "Jme barre"}
                  handleClick={() => leaveTeam(team)}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
