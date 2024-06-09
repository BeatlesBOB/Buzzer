import dotenv from "dotenv";
import { Socket } from "socket.io";
import { Room } from "./interface";
import { instrument } from "@socket.io/admin-ui";
import {
  handeRoomJoin,
  handleRoomCreate,
  handleRoomInfo,
  handleRoomLeave,
} from "./events/room";
import { handleGamePause, handleGameStart } from "./events/game";
import {
  handleTeamCreate,
  handleTeamJoin,
  handleTeamLeave,
} from "./events/team";
import {
  handleAnswer,
  handleAnswerResetTeam,
  handleAnswerType,
  hansleAnswerResetAll,
} from "./events/answer";
import { handlePointResetAll, handlePointUpdate } from "./events/point";
dotenv.config();

import express, { Request, Response } from "express";
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("./node_modules/@socket.io/admin-ui/ui/dist"));
app.listen(process.env.ADMIN_PORT);

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  connectionStateRecovery: {},
  cors: {
    origin: [
      "http://localhost:3030",
      process.env.FRONTEND_URL,
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  },
});

app.use("/", (req: Request, res: Response) => {
  res.send("Server is running");
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
  // ROOM
  socket.on("room:create", () => handleRoomCreate(socket));
  socket.on("room:info", (payload) => handleRoomInfo(socket, payload));
  socket.on("room:join", (payload) => handeRoomJoin(socket, payload));
  socket.on("room:leave", (payload) => handleRoomLeave(socket, payload));

  // GAME
  socket.on("game:start", () => handleGameStart(socket));
  socket.on("game:pause", () => handleGamePause(socket));

  // TEAM
  socket.on("team:create", (payload) => handleTeamCreate(socket, payload));
  socket.on("team:join", (payload) => handleTeamJoin(socket, payload));
  socket.on("team:leave", () => handleTeamLeave(socket));

  // ANSWER
  socket.on("game:answer", (payload) => handleAnswer(socket, payload));
  socket.on("game:answer:type", (payload) => handleAnswerType(socket, payload));
  socket.on("game:answer:reset", () => hansleAnswerResetAll(socket));
  socket.on("game:answer:reset:team", (payload) =>
    handleAnswerResetTeam(socket, payload)
  );

  // POINT
  socket.on("game:point:reset", () => handlePointResetAll(socket));
  socket.on("game:point", (payload) => handlePointUpdate(socket, payload));
};

io.on("connection", onConnection);

httpServer.listen(process.env.APP_PORT, () =>
  console.log(`http://localhost:${process.env.APP_PORT}`)
);
