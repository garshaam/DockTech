import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport"; // package name may differ in thy setup
import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";
import { monitor } from "@colyseus/monitor";

import { fileURLToPath } from "node:url";

import { StandardRoom } from "./rooms/StandardRoom";


export const port = Number(process.env.PORT || 2567);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const app = express();
const gameServer = new Server({
  transport: new WebSocketTransport({
    pingInterval: 3000,
    pingMaxRetries: 2
  })
});

gameServer.define("standard_room", StandardRoom);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/", express.static(path.resolve(__dirname, "public")));

// add colyseus monitor
const auth = basicAuth({ users: { 'butts': 'garsha' }, challenge: true });
app.use("/colyseus", auth, monitor());

gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`);
