import dotenv from "dotenv";
import { Socket } from "socket.io";
import { Room } from "./utils/interface";
import {
  createRoom,
  handleLobbyStatus,
  joinRoom,
  leaveRoom,
  startGame,
  gamePause,
  getInfo,
} from "./event/room";
import {
  handleAnswer,
  resetAllAnswer,
  resetTeamAnswer,
  handleBuzzerType,
} from "./event/game";
import { resetAllPoint, setPoint } from "./event/point";
import { instrument } from "@socket.io/admin-ui";
dotenv.config();

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("./node_modules/@socket.io/admin-ui/ui/dist"));
app.listen(process.env.ADMIN_PORT);

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3030",
      process.env.FRONTEND_URL,
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  },
});

instrument(io, {
  auth:
    process.env.PASSWORD && process.env.USERNAME
      ? {
          type: "basic",
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
        }
      : false,
  mode: "development",
});

export const Rooms = new Map<string, Room>();

const onConnection = (socket: Socket) => {
  socket.on("room:create", () => createRoom(socket));
  socket.on("room:join", (payload) => joinRoom(socket, payload));
  socket.on("room:leave", (payload) => leaveRoom(socket, payload));
  socket.on("room:lobby", (payload) => handleLobbyStatus(socket, payload));
  socket.on("room:start", () => startGame(socket));
  socket.on("room:pause", () => gamePause(socket));

  socket.on("game:answer", (payload) => handleAnswer(socket, payload));
  socket.on("game:answer:type", (payload) => handleBuzzerType(socket, payload));
  socket.on("game:buzzer:reset", () => resetAllAnswer(socket));
  socket.on("game:buzzer:reset:team", (payload) =>
    resetTeamAnswer(socket, payload)
  );
  socket.on("game:point:reset", () => resetAllPoint(socket));
  socket.on("game:point", (payload) => setPoint(socket, payload));

  socket.on("user:info", (payload) => getInfo(socket, payload));
};

io.on("connection", onConnection);

httpServer.listen(process.env.APP_PORT, () =>
  console.log(`http://localhost:${process.env.APP_PORT}`)
);
