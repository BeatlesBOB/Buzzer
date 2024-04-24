import { ReactNode, createContext, useState } from "react";
import { Room, Team } from "../types/interfaces";
import useSocket from "../hook/useSocket";

export interface IGameContext {
  room?: Room;
  setRoom: (room: Room) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  teams?: Array<Team>;
  setTeams: (teams: Array<Team>) => void;
  resetTeamBuzzer: (team: Team) => void;
  updateTeamPoint: (team: Team, point: number) => void;
  joinOrCreateATeam: (team: Team | null | undefined) => void;
  startGame: () => void;
  resetAllBuzzer: () => void;
  resetAllPoints: () => void;
}
export const GameContext = createContext<IGameContext>({} as IGameContext);

export interface IGameContextProvider {
  children: ReactNode;
}

export default function GameContextProvider({
  children,
}: IGameContextProvider) {
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [teams, setTeams] = useState<Array<Team>>([]);
  const { dispatch } = useSocket();

  const resetTeamBuzzer = (team: Team) => {
    dispatch("game:buzzer:reset:team", { id: room?.id, teamId: team.id });
  };

  const updateTeamPoint = (team: Team, point: number) => {
    dispatch("game:status", { id: room?.id, teamId: team.id, point });
  };

  const joinOrCreateATeam = (team: Team | null | undefined = null) => {
    dispatch("room:join", { id: room?.id, teamId: team?.id });
  };

  const startGame = () => {
    dispatch("room:start", { id: room?.id });
  };

  const resetAllBuzzer = () => {
    dispatch("game:buzzer:reset", { id: room?.id });
  };

  const resetAllPoints = () => {
    dispatch("game:point:reset", { id: room?.id });
  };

  return (
    <GameContext.Provider
      value={{
        room,
        setRoom,
        isAdmin,
        setIsAdmin,
        setTeams,
        teams,
        resetAllBuzzer,
        resetAllPoints,
        startGame,
        joinOrCreateATeam,
        updateTeamPoint,
        resetTeamBuzzer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
