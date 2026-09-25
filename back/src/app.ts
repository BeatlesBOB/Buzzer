import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import type { Config } from "./config";
import { Store } from "./store";
import { attachGame, GameServer } from "./socket/game";

export const createApp = (config: Config) => {
  const app = express();
  app.get("/", (_req, res) => res.send("Buzzer backend"));
  app.get("/health", (_req, res) => res.json({ ok: true }));

  const httpServer = createServer(app);
  const origins = config.adminUi ? [...config.corsOrigins, "https://admin.socket.io"] : config.corsOrigins;
  const io: GameServer = new Server(httpServer, {
    addTrailingSlash: false,
    cors: { origin: origins, credentials: true },
  });

  // Admin UI socket.io (https://admin.socket.io) : uniquement si des identifiants sont configurés.
  if (config.adminUi) {
    instrument(io as unknown as Server, { auth: { type: "basic", ...config.adminUi }, mode: "production" });
  }

  const store = new Store();
  const stopGame = attachGame(io, store, config);

  const stop = async () => {
    stopGame();
    await io.close();
  };

  return { app, httpServer, io, store, stop };
};
