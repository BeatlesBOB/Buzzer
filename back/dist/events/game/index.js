"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGamePause = exports.handleGameStart = void 0;
const __1 = require("../..");
const error_1 = require("../../utils/error");
const handleGameStart = (socket) => {
    const { isAdmin, room: roomId } = socket.data.user;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    const room = __1.Rooms.get(roomId);
    if (!isAdmin) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ADMIN);
    }
    room.isStarted = true;
    __1.io.to(room.id).emit("game:start", {
        room,
    });
};
exports.handleGameStart = handleGameStart;
const handleGamePause = (socket) => {
    const { isAdmin, room: roomId } = socket.data.user;
    if (!__1.Rooms.has(roomId) || !isAdmin) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM_OR_ADMIN);
    }
    const room = __1.Rooms.get(roomId);
    room.isStarted = false;
    __1.io.to(room.id).emit("game:pause", { room });
};
exports.handleGamePause = handleGamePause;
