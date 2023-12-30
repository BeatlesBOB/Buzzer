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
}

export interface Data {
  id: string;
  name: string;
  point?: number;
}
