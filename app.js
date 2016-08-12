import express from "express";
import http from "http";
import socketIO from "socket.io";
import spheroWebSocket from "sphero-websocket";
import argv from "argv";

import config from "./config";
import SocketManager from "./components/socketManager";
import ControllerManager from "./components/controllerManager";
// import OrbManager from "./orbManager";
// import SpheroErrorTracker from "./spheroErrorTracker";
import Connector from "./components/connector";

// spheroErrorTracker は、console.error をラップするので、
// 先にやる。
// const connector = new Connector();
// new SpheroErrorTracker(connector);

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;

const app = express();
app.use(express.static("dashboard/"));

const server = http.Server(app);
server.listen(8082);

const spheroServer = spheroWebSocket(config.websocket, isTestMode).spheroServer;
new Connector(spheroServer);
new SocketManager(server);
new ControllerManager(spheroServer);
// new OrbManager(spheroServer, isTestMode, connector);
