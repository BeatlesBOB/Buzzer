export interface Room {
  id: string;
  teams: Array<Team>;
  hasStarted: boolean;
  admin: Admin;
}

export interface Team {
  id: string;
  name: string;
  point: number;
  hasBuzzed: boolean;
  users: Array<User>;
}

export interface User {
  id: string;
  name: string;
  room: string;
  hasBuzzed: boolean;
  team: string;
}

export interface Admin {
  id: string;
  room: string;
  isAdmin: boolean;
}

export type BuzzerType = "speed" | "choice" | "text";
