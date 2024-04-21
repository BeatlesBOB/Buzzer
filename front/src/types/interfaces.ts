export interface Room {
  id?: string;
  teams: Array<unknown>;
  hasStarted?: boolean;
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
  teamName: string;
  point?: number;
  userName?: string;
}

export interface User {
  id: string;
  name: string;
}
