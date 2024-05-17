import { Rooms } from "../..";
import { Admin, Room } from "../../interface";

export const initRoom = (id: string, admin: Admin) => {
  const room = { id, teams: [], isStarted: false, admin };
  Rooms.set(id, room);
  return room;
};

export const deleteRoom = (room: Room): boolean => {
  return Rooms.delete(room.id);
};
