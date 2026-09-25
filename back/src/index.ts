import dotenv from "dotenv";
import { createApp } from "./app";
import { loadConfig } from "./config";

dotenv.config();

const config = loadConfig();
const { app, httpServer } = createApp(config);

httpServer.listen(config.port, () => console.log(`Buzzer backend on http://localhost:${config.port}`));

export = app;
