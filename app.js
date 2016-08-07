import express from "express";
import http from "http";
import socketIO from "socket.io";
import spheroWebSocket from "sphero-websocket";
import argv from "argv";

import config from "./config";
import SocketManager from "./socketManager";
import ControllerModel from "./controllerModel";
import SpheroServerObserver from "./spheroServerObserver";

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;

const app = express();
app.use(express.static("dashboard/"));

const server = http.Server(app);
server.listen(8082);

new SocketManager(server);
const controllerModel = new ControllerModel();
new SpheroServerObserver(config.websocket, isTestMode, controllerModel);
