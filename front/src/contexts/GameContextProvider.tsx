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
  joinOrCreateATeam: (team: Team | null) => void;
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
    dispatch({
      type: "game:buzzer:reset:team",
      payload: { id: room?.id, teamId: team.id },
    });
  };

  const updateTeamPoint = (team: Team, point: number) => {
    dispatch({
      type: "game:status",
      payload: { id: room?.id, teamId: team.id, point },
    });
  };

  const joinOrCreateATeam = (team: Team | null = null) => {
    dispatch({
      type: "room:join",
      payload: { id: room?.id, teamId: team?.id },
    });
  };

  const startGame = () => {
    dispatch({
      type: "room:start",
      payload: { id: room?.id },
    });
  };

  const resetAllBuzzer = () => {
    dispatch({
      type: "game:buzzer:reset",
      payload: { id: room?.id },
    });
  };

  const resetAllPoints = () => {
    dispatch({
      type: "game:point:reset",
      payload: { id: room?.id },
    });
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
