"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAnswerType = exports.handleAnswerResetTeam = exports.hansleAnswerResetAll = exports.handleAnswer = void 0;
const __1 = require("../..");
const team_1 = require("../../utils/team");
const error_1 = require("../../utils/error");
const user_1 = require("../../utils/user");
const handleAnswer = (socket, payload) => {
    var _a;
    const { team: teamId, room: roomId, id: userId } = socket.data.user;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    const room = __1.Rooms.get(roomId);
    if (!(room === null || room === void 0 ? void 0 : room.isStarted)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.DOESNT_STARTED);
    }
    const team = (0, team_1.getTeamById)(room, teamId);
    if (!team || (team === null || team === void 0 ? void 0 : team.hasBuzzed)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.BUZZER);
    }
    team.hasBuzzed = true;
    const user = (0, user_1.getUserById)(team, userId);
    if (!user) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.USER);
    }
    const timer = (_a = process.env.TIMEOUT_ANSWER) !== null && _a !== void 0 ? _a : "30000";
    user.hasBuzzed = true;
    __1.io.to(room.id).emit("game:answer", {
        room,
        team,
        user,
        timer,
        answer: payload === null || payload === void 0 ? void 0 : payload.answer,
    });
    setTimeout(() => {
        team.hasBuzzed = false;
        user.hasBuzzed = false;
        __1.io.to(room.id).emit("game:answer:reset", { room, team, user });
    }, parseInt(timer));
};
exports.handleAnswer = handleAnswer;
const hansleAnswerResetAll = (socket) => {
    const { isAdmin, room: roomId } = socket.data.user;
    if (!__1.Rooms.has(roomId) || !isAdmin) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM_OR_ADMIN);
    }
    const room = __1.Rooms.get(roomId);
    room.teams.forEach((team) => {
        team.hasBuzzed = false;
    });
    __1.io.to(room.id).emit("game:answer:reset", { room });
};
exports.hansleAnswerResetAll = hansleAnswerResetAll;
const handleAnswerResetTeam = (socket, payload) => {
    const { team: teamId } = payload;
    const { isAdmin, room: roomId } = socket.data.user;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    const room = __1.Rooms.get(roomId);
    const team = (0, team_1.getTeamById)(room, teamId);
    if (!team || !isAdmin) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM_OR_ADMIN);
    }
    team.hasBuzzed = false;
    __1.io.to(room.id).emit("game:answer:reset:all", { room });
};
exports.handleAnswerResetTeam = handleAnswerResetTeam;
const handleAnswerType = (socket, payload) => {
    const { isAdmin, room: roomId } = socket.data.user;
    if (!isAdmin) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ADMIN);
    }
    __1.io.to(roomId, "game:answer:type");
};
exports.handleAnswerType = handleAnswerType;
