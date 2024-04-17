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
  users: Array<string>;
}

export interface Data {
  id: string;
  teamId: string;
  point?: number;
  name?: string;
}
