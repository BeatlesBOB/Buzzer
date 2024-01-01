import dotenv from "dotenv";
import { Socket } from "socket.io";
import { Room } from "./utils/interface";
import { createRoom, joinRoom, leaveRoom, startGame } from "./event/room";
import { answer, resetAllAnswer, resetTeamAnswer } from "./event/game";
import { setPoint } from "./event/point";
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
    origin: ["http://localhost:3030", "http://localhost:5500"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: "development",
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

httpServer.listen(process.env.APP_PORT, () =>
  console.log(`http://localhost:${process.env.APP_PORT}`)
);
