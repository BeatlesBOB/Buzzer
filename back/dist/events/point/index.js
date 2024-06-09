"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePointResetAll = exports.handlePointUpdate = void 0;
const __1 = require("../..");
const error_1 = require("../../utils/error");
const team_1 = require("../../utils/team");
const handlePointUpdate = (socket, payload) => {
    const { point, team: teamId } = payload;
    const { room: roomId, isAdmin } = socket.data.user;
    if (!__1.Rooms.has(roomId) || !isAdmin) {
        return (0, error_1.handleError)(socket, "No room or your not the Admin of the current Game");
    }
    const room = __1.Rooms.get(roomId);
    const team = (0, team_1.getTeamById)(room, teamId);
    if (!team) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.TEAM);
    }
    team.point = point || 0;
    __1.io.emit("game:point", { room: room });
};
exports.handlePointUpdate = handlePointUpdate;
const handlePointResetAll = (socket) => {
    const { isAdmin, room: roomId } = socket.data.user;
    if (!__1.Rooms.has(roomId) || !isAdmin) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM_OR_ADMIN);
    }
    const room = __1.Rooms.get(roomId);
    room.teams.forEach((team) => {
        team.point = 0;
    });
    __1.io.emit("game:point:reset", { room });
};
exports.handlePointResetAll = handlePointResetAll;
