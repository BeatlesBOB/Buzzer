import dotenv from "dotenv";
import { Socket } from "socket.io";
import { Room } from "./utils/interface";
import { createRoom, joinRoom, leaveRoom, startGame } from "./event/room";
import { answer, resetAllAnswer, resetTeamAnswer } from "./event/game";
import { resetAllPoint, setPoint } from "./event/point";
import { instrument } from "@socket.io/admin-ui";
import { createTeam, initRoom, mapToString } from "./utils/utils";
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
      "http://localhost:5173",
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
  socket.on("room:create", (payload) => createRoom(socket));
  socket.on("room:join", (payload) => joinRoom(socket, payload));
  socket.on("room:leave", (payload) => leaveRoom(socket, payload));
  socket.on("room:start", (payload) => startGame(socket));
  socket.on("game:buzzer", (payload) => answer(socket));
  socket.on("game:buzzer:reset", (payload) => resetAllAnswer(socket));
  socket.on("game:buzzer:reset:team", (payload) => resetTeamAnswer(socket));
  socket.on("game:point:reset", (payload) => resetAllPoint(socket));
  socket.on("game:point", (payload) => setPoint(socket, payload));
};

io.on("connection", onConnection);

httpServer.listen(process.env.APP_PORT, () =>
  console.log(`http://localhost:${process.env.APP_PORT}`)
);
