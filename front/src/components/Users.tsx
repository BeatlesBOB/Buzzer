import { Team } from "../utils/interfaces";

export interface Users {
  teams?: Array<Team>;
  isAdmin?: boolean;
  updateTeamPoint?: (team: Team, point: number) => void;
  resetTeamBuzzer?: (team: Team) => void;
  joinTeam?: (team?: Team, name?: string) => void;
}

export default function Users({
  teams,
  isAdmin = false,
  updateTeamPoint,
  resetTeamBuzzer,
  joinTeam,
}: Users) {
  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto h-dvh">
      {teams?.map((team: Team) => {
        return (
          <li className="p-5 shadow-lg flex font-primary" key={team.id}>
            <p className="capitalize  text-lg">{team.name}</p>
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
                <button
                  onClick={() => resetTeamBuzzer?.(team)}
                  className="font-primary font-regular underline"
                >
                  Reset buzzer
                </button>
              </div>
            )}
            {!isAdmin && (
              <button
                onClick={() => joinTeam?.(team)}
                className="font-primary font-regular underline"
              >
                Join team
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
