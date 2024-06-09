"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MSG = exports.handleError = void 0;
const __1 = require("../..");
const handleError = (socket, msg) => {
    __1.io.to(socket.id).emit("buzzer:notification", { msg });
};
exports.handleError = handleError;
exports.ERROR_MSG = {
    ROOM: "Pas de room Bolosse",
    ALREADY_STARTED: "Trop tard, ça a déjà commencé",
    TEAM: "Pas de team Bolosse",
    DEFAULT: "Y'a couille dans le potage",
    ROOM_OR_ADMIN: "T'es pas le boss de la room ! enfin si y'a une room ...",
    TEAM_OR_USERNAME: "Pas de team ou nom d'utilisateur Bolosse",
    ADMIN: "T'es pas le boss de la room !",
    USER: "Utilisateur perdu :eyes:",
    BUZZER: "Déja buzzer",
    DOESNT_STARTED: "La game n'a pas commencer tu va te calmer direct",
};
Object.freeze(exports.ERROR_MSG);
