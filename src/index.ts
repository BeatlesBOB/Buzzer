import { Socket } from "socket.io";
import { Room } from "./utils/interface";
import { createRoom, joinRoom, leaveRoom, startGame } from "./event/room";
import { answer, resetAllAnswer, resetTeamAnswer } from "./event/game";
import { setPoint } from "./event/point";

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: "*",
});

export const Rooms = new Map<string, Room>();

const onConnection = (socket: Socket) => {
  socket.on("room:create", (payload) => createRoom(socket));
  socket.on("room:join", (payload) => joinRoom(socket, payload));
  socket.on("room:leave", (payload) => leaveRoom(socket, payload));
  socket.on("room:start", (payload) => startGame(socket, payload));
  socket.on("game:answer", (payload) => answer(socket, payload));
  socket.on("game:answer:reset", (payload) => resetAllAnswer(socket, payload));
  socket.on("game:answer:reset:team", (payload) =>
    resetTeamAnswer(socket, payload)
  );
  socket.on("game:point", (payload) => setPoint(socket, payload));
};

io.on("connection", onConnection);

httpServer.listen(3000, () => console.log("started"));
