"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserData = exports.removeUserByTeamId = exports.getUserById = void 0;
const getUserById = (team = {}, userId) => {
    var _a;
    const index = (_a = team === null || team === void 0 ? void 0 : team.users) === null || _a === void 0 ? void 0 : _a.findIndex((user) => {
        return user.id === userId;
    });
    if (index === undefined || index === -1) {
        return false;
    }
    return team.users[index];
};
exports.getUserById = getUserById;
const removeUserByTeamId = (team, userId) => {
    var _a;
    const index = (_a = team === null || team === void 0 ? void 0 : team.users) === null || _a === void 0 ? void 0 : _a.findIndex((user) => {
        return user.id === userId;
    });
    if (index === undefined || index === -1) {
        return false;
    }
    team.users.splice(index, 1);
    return true;
};
exports.removeUserByTeamId = removeUserByTeamId;
const setUserData = (socket, user) => {
    return (socket.data.user = Object.assign(socket.data.user || {}, user));
};
exports.setUserData = setUserData;
