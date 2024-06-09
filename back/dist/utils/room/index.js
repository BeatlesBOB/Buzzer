"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.initRoom = void 0;
const __1 = require("../..");
const initRoom = (id, admin) => {
    const room = { id, teams: [], isStarted: false, admin };
    __1.Rooms.set(id, room);
    return room;
};
exports.initRoom = initRoom;
const deleteRoom = (room) => {
    return __1.Rooms.delete(room.id);
};
exports.deleteRoom = deleteRoom;
