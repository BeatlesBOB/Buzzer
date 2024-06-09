"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rooms = exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const admin_ui_1 = require("@socket.io/admin-ui");
const room_1 = require("./events/room");
const game_1 = require("./events/game");
const team_1 = require("./events/team");
const answer_1 = require("./events/answer");
const point_1 = require("./events/point");
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const app = (0, express_1.default)();
app.use(express_1.default.static("./node_modules/@socket.io/admin-ui/ui/dist"));
app.listen(process.env.ADMIN_PORT);
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    connectionStateRecovery: {},
    cors: {
        origin: [
            "http://localhost:3030",
            ((_a = process.env.FRONTEND_URL) === null || _a === void 0 ? void 0 : _a.toString()) || "",
            "http://127.0.0.1:5500",
        ],
        credentials: true,
    },
});
app.get("/", (_req, res) => {
    return res.send("Express Typescript on Vercel");
});
(0, admin_ui_1.instrument)(exports.io, {
    auth: process.env.PASSWORD && process.env.USERNAME
        ? {
            type: "basic",
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
        }
        : false,
    mode: "development",
});
exports.Rooms = new Map();
const onConnection = (socket) => {
    // ROOM
    socket.on("room:create", () => (0, room_1.handleRoomCreate)(socket));
    socket.on("room:info", (payload) => (0, room_1.handleRoomInfo)(socket, payload));
    socket.on("room:join", (payload) => (0, room_1.handeRoomJoin)(socket, payload));
    socket.on("room:leave", (payload) => (0, room_1.handleRoomLeave)(socket, payload));
    // GAME
    socket.on("game:start", () => (0, game_1.handleGameStart)(socket));
    socket.on("game:pause", () => (0, game_1.handleGamePause)(socket));
    // TEAM
    socket.on("team:create", (payload) => (0, team_1.handleTeamCreate)(socket, payload));
    socket.on("team:join", (payload) => (0, team_1.handleTeamJoin)(socket, payload));
    socket.on("team:leave", () => (0, team_1.handleTeamLeave)(socket));
    // ANSWER
    socket.on("game:answer", (payload) => (0, answer_1.handleAnswer)(socket, payload));
    socket.on("game:answer:type", (payload) => (0, answer_1.handleAnswerType)(socket, payload));
    socket.on("game:answer:reset", () => (0, answer_1.hansleAnswerResetAll)(socket));
    socket.on("game:answer:reset:team", (payload) => (0, answer_1.handleAnswerResetTeam)(socket, payload));
    // POINT
    socket.on("game:point:reset", () => (0, point_1.handlePointResetAll)(socket));
    socket.on("game:point", (payload) => (0, point_1.handlePointUpdate)(socket, payload));
};
exports.io.on("connection", onConnection);
const port = process.env.PORT || 8080;
httpServer.listen(process.env.PORT, () => console.log(`http://localhost:port${port}`));
module.exports = app;
