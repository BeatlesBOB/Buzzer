"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoomInfo = exports.handeRoomJoin = exports.handleRoomLeave = exports.handleRoomCreate = void 0;
const uuid_1 = require("uuid");
const __1 = require("../..");
const room_1 = require("../../utils/room");
const error_1 = require("../../utils/error");
const team_1 = require("../../utils/team");
const user_1 = require("../../utils/user");
const handleRoomCreate = (socket) => {
    const id = (0, uuid_1.v4)();
    const user = {
        id: socket.id,
        room: id,
        isAdmin: true,
    };
    const room = (0, room_1.initRoom)(id, user);
    (0, user_1.setUserData)(socket, user);
    socket.join(id);
    __1.io.to(socket.id).emit("room:create", {
        room: room,
        user,
    });
};
exports.handleRoomCreate = handleRoomCreate;
const handleRoomLeave = (socket, payload) => {
    const { team: teamId, isAdmin, room: roomId } = socket.data.user;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    let room = __1.Rooms.get(roomId);
    if (!isAdmin) {
        const team = (0, team_1.getTeamById)(room, teamId);
        if (!team) {
            return (0, error_1.handleError)(socket, error_1.ERROR_MSG.TEAM);
        }
        (0, user_1.removeUserByTeamId)(team, socket.id);
        if (team.users.length === 0) {
            (0, team_1.removeTeamById)(room, teamId);
        }
        const user = (0, user_1.setUserData)(socket, {
            id: undefined,
            name: undefined,
            room: undefined,
            hasBuzzed: undefined,
            team: undefined,
        });
        if (room.teams.length === 0) {
            room = (0, room_1.deleteRoom)(room) ? {} : room;
        }
        __1.io.to(roomId).emit("room:leave", {
            room,
        });
        __1.io.to(socket.id).emit("room:user", {
            user,
        });
        socket.leave(room.id);
    }
    else if (isAdmin) {
        const { team: teamId, user } = payload;
        const team = (0, team_1.getTeamById)(room, teamId);
        if (!team) {
            return (0, error_1.handleError)(socket, error_1.ERROR_MSG.TEAM);
        }
        if (teamId && user === undefined) {
            (0, team_1.removeTeamById)(room, teamId);
        }
        else if (team && user) {
            (0, user_1.removeUserByTeamId)(team, user);
        }
        if (team.users.length === 0) {
            (0, team_1.removeTeamById)(room, team.id);
        }
        __1.io.to(roomId).emit("room:leave", {
            room,
        });
    }
};
exports.handleRoomLeave = handleRoomLeave;
const handeRoomJoin = (socket, payload) => {
    const { room: roomId } = payload;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    const room = __1.Rooms.get(roomId);
    socket.join(room.id);
    (0, user_1.setUserData)(socket, { room: room.id });
    __1.io.to(socket.id).emit("room:join", { room });
};
exports.handeRoomJoin = handeRoomJoin;
const handleRoomInfo = (socket, payload) => {
    const { room: roomId, user: userId, team: teamId } = payload;
    if (!__1.Rooms.has(roomId)) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.ROOM);
    }
    const room = __1.Rooms.get(roomId);
    const team = (0, team_1.getTeamById)(room, teamId);
    const user = (0, user_1.getUserById)(team, userId) || (room.admin.id === userId && room.admin);
    if (!user) {
        return (0, error_1.handleError)(socket, error_1.ERROR_MSG.USER);
    }
    (0, user_1.setUserData)(socket, user);
    __1.io.to(socket.id).emit("room:info", {
        user,
        room,
    });
};
exports.handleRoomInfo = handleRoomInfo;
