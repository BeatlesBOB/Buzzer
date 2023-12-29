import { Socket } from "socket.io";
import { Room } from "./utils/interface";
import { createTeam, initRoom } from "./utils/utils";

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: "*",
});

export const Rooms = new Map<string, Room>();

import { createRoom, joinRoom, leaveRoom } from "./event/game";
import { answer } from "./event/buzz";

const onConnection = (socket: Socket) => {
  socket.on("room:create", (payload) => createRoom(socket));
  socket.on("room:join", (payload) => joinRoom(socket, payload));
  socket.on("room:leave", (payload) => leaveRoom(socket, payload));
  socket.on("game:answer", (payload) => answer(socket, payload));
  socket.on("game:point", () => {});
};

io.on("connection", onConnection);

httpServer.listen(3000, () => console.log("started"));
