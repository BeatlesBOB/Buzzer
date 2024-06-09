"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTeamById = exports.getTeamById = exports.createTeam = void 0;
const createTeam = (id, name) => {
    return {
        id,
        name,
        point: 0,
        hasBuzzed: false,
        users: [],
    };
};
exports.createTeam = createTeam;
const getTeamById = (room, id) => {
    const index = room.teams.findIndex((team) => {
        return team.id === id;
    });
    if (index === undefined || index === -1) {
        return undefined;
    }
    return room.teams[index];
};
exports.getTeamById = getTeamById;
const removeTeamById = (room, id) => {
    const currentTeam = (0, exports.getTeamById)(room, id);
    const index = room.teams.findIndex((team) => {
        return team.id === (currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam.id);
    });
    if (index === undefined || index === -1) {
        return false;
    }
    room.teams.splice(index, 1);
    return true;
};
exports.removeTeamById = removeTeamById;
