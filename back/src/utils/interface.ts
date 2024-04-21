export interface Room {
  id: string;
  teams: Map<string, Team>;
  hasStarted: boolean;
}

export interface Team {
  id: string;
  name: string;
  point: number;
  hasBuzzed: boolean;
  users: Array<User>;
}

export interface Data {
  id: string;
  teamId: string;
  point?: number;
  teamName?: string;
  userName?: string;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
}
