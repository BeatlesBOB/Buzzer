import { Team } from "../utils/interfaces";
import Button from "./Button";

export interface Users {
  teams?: Array<Team>;
  isAdmin?: boolean;
  updateTeamPoint?: (team: Team, point: number) => void;
  resetTeamBuzzer?: (team: Team) => void;
  joinTeam?: (team?: Team, name?: string) => void;
  leave: (team: Team) => void;
}

export default function Users({
  teams,
  isAdmin = false,
  updateTeamPoint,
  resetTeamBuzzer,
  joinTeam,
  leave,
}: Users) {
  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto">
      {teams?.map((team: Team) => {
        return (
          <li className="p-5 shadow-lg flex font-primary" key={team.id}>
            <p className="capitalize  text-lg">{team.name}</p>
            <Button label="Leave" handleClick={() => leave?.(team)} />
            {isAdmin && (
              <div className="flex ml-auto">
                <input
                  min={0}
                  type="number"
                  value={team.point}
                  onChange={(e) => {
                    updateTeamPoint?.(team, parseInt(e.target.value));
                  }}
                />
                <Button
                  label="Reset buzzer"
                  handleClick={() => resetTeamBuzzer?.(team)}
                />
              </div>
            )}
            {!isAdmin && (
              <Button label="Join team" handleClick={() => joinTeam?.(team)} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
