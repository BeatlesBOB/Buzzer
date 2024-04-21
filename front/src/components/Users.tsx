import { Team } from "../types/interfaces";
import Button from "./Button";

export interface IUsers {
  teams?: Array<Team>;
  isAdmin: boolean;
  leaveTeam: (team: Team) => void;
  updateTeamPoint?: (team: Team, point: number) => void;
  resetTeamBuzzer?: (team: Team) => void;
  joinTeam?: (team: Team | null | undefined) => void;
}

export default function Users({
  isAdmin,
  teams,
  leaveTeam,
  updateTeamPoint,
  resetTeamBuzzer,
  joinTeam,
}: IUsers) {
  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto">
      {teams?.map((team: Team) => {
        return (
          <li className="p-5 shadow-lg flex font-primary" key={team.id}>
            <p className="capitalize  text-lg">{team.name}</p>
            <Button label="Leave" handleClick={() => leaveTeam?.(team)} />
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
