import express from "express";
import http from "http";
import socketIO from "socket.io";

import SocketManager from "./socketManager";

const app = express();
app.use(express.static("dashboard/"));

const server = http.Server(app);
server.listen(8082);

new SocketManager(server);
