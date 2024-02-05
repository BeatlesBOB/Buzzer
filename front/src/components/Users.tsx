import React from "react";
import { Team } from "../utils/interfaces";

export interface Users {
  teams: Array<unknown>;
  isAdmin?: boolean;
  updateTeamPoint: (team: Team, point: number) => void;
  resetTeamBuzzer: (team: Team) => void;
}

export default function Users({
  teams,
  isAdmin = false,
  updateTeamPoint,
  resetTeamBuzzer,
}: Users) {
  return (
    <ul className="flex flex-col gap-4 py-4 overflow-y-auto h-dvh">
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        teams.map((team: any) => {
          return (
            <li className="p-5 shadow-lg flex font-primary" key={team[0]}>
              <p className="capitalize  text-lg">{team[1].name}</p>
              {isAdmin && (
                <div className="flex ml-auto">
                  <input
                    min={0}
                    type="number"
                    value={team[1].point}
                    onChange={(e) => {
                      updateTeamPoint(team[1], parseInt(e.target.value));
                    }}
                  />
                  <button
                    onClick={() => resetTeamBuzzer(team[1])}
                    className="font-primary font-regular underline"
                  >
                    Reset buzzer
                  </button>
                </div>
              )}
            </li>
          );
        })
      }
    </ul>
  );
}
