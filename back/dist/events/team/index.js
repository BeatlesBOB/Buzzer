"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTeamLeave = exports.handleTeamJoin = exports.handleTeamCreate = void 0;
const uuid_1 = require("uuid");
const __1 = require("../..");
const team_1 = require("../../utils/team");
const error_1 = require("../../utils/error");
const user_1 = require("../../utils/user");
const handleTeamCreate = (socket, payload) => {
    const { room: roomId } = socket.data.user;
    const { userName, teamName } = payload;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, "Pas de room Bolosse");
    }
    const room = __1.Rooms.get(roomId);
    if (room.isStarted) {
        return (0, error_1.handleError)(socket, "Trop tard, ça a déjà commencé");
    }
    if (!userName) {
        return (0, error_1.handleError)(socket, "Pas de room ou nom d'utilisateur Bolosse");
    }
    const id = (0, uuid_1.v4)();
    const team = (0, team_1.createTeam)(id, teamName);
    room.teams.push(team);
    const user = {
        id: socket.id,
        name: userName,
        hasBuzzed: false,
        team: team.id,
        room: room.id,
    };
    socket.join(team.id);
    team.users.push(user);
    (0, user_1.setUserData)(socket, user);
    __1.io.to(room.id).emit("team:create", { room });
    __1.io.to(socket.id).emit("user:info", {
        user,
    });
};
exports.handleTeamCreate = handleTeamCreate;
const handleTeamJoin = (socket, payload) => {
    const { room: roomId } = socket.data.user;
    const { userName, teamId } = payload;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    const room = __1.Rooms.get(roomId);
    if (room.isStarted) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ALREADY_STARTED);
    }
    let team = (0, team_1.getTeamById)(room, teamId);
    if (!team || !userName) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.TEAM_OR_USERNAME);
    }
    const user = {
        id: socket.id,
        name: userName,
        hasBuzzed: false,
        team: team.id,
        room: room.id,
    };
    socket.join(team.id);
    team.users.push(user);
    (0, user_1.setUserData)(socket, user);
    __1.io.to(room.id).emit("team:join", { room });
    __1.io.to(socket.id).emit("user:info", {
        user,
    });
};
exports.handleTeamJoin = handleTeamJoin;
const handleTeamLeave = (socket) => {
    const { room: roomId, team: teamId, id } = socket.data.user;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    let room = __1.Rooms.get(roomId);
    let team = (0, team_1.getTeamById)(room, teamId);
    if (!team) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.TEAM);
    }
    const isRemoved = (0, user_1.removeUserByTeamId)(team, id);
    if (!isRemoved) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.DEFAULT);
    }
    if (team.users.length === 0) {
        (0, team_1.removeTeamById)(room, teamId);
    }
    const user = {
        team: undefined,
    };
    socket.leave(team.id);
    (0, user_1.setUserData)(socket, user);
    __1.io.to(room.id).emit("team:leave", { room });
    __1.io.to(socket.id).emit("user:info", {
        user,
    });
};
exports.handleTeamLeave = handleTeamLeave;
