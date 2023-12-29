import { Socket } from "socket.io";
import { Room, Team } from "../utils/interface";
import { Rooms } from "..";

export const answer = (
  socket: Socket,
  { room, team }: { room: Room; team: Team }
) => {
  Rooms.get(room.id);
};
