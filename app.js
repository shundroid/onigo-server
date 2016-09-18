import express from "express";
import http from "http";
import socketIO from "socket.io";
import spheroWebSocket from "sphero-websocket";
import argv from "argv";

import config from "./config";
import SocketManager from "./components/socketManager";
import ControllerManager from "./middlewares/controllerManager";
import OrbManager from "./middlewares/orbManager";
import Connector from "./middlewares/connector";
import subjects from "./subjects/appSubjects";

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;
subjects.isTestMode.publish(isTestMode);

const app = express();
app.use(express.static("dashboard/"));

const server = http.Server(app);
server.listen(8082);

const spheroServer = spheroWebSocket(config.websocket, isTestMode).spheroServer;

// onigo middlewares
const connector = new Connector(spheroServer);
const controllerManager = new ControllerManager(spheroServer);
const orbManager = new OrbManager(spheroServer);

// sequence
subjects.addOrb.defineSequence("addOrb", connector, orbManager);
subjects.addClient.defineSequence("addClient", controllerManager);
subjects.removeClient.defineSequence("removeClient", controllerManager);
subjects.setNameClient.defineSequence("setNameClient", controllerManager);
subjects.checkBattery.defineSequence("checkBattery", orbManager);
subjects.gameState.defineSequence("gameState", controllerManager);

// component
new SocketManager(server);
