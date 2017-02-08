const originalError = console.error;

let error121Count = 0;
console.error = function(message) {
  const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code (121|1167)/.exec(message);
  if (exec121Error !== null) {
    const port = exec121Error[2];
    if (connector.isConnecting(port)) {
      error121Count++;
      if (error121Count < 5) {
        dashboard.log(`Catched 121 error. Reconnecting... (${error121Count})`, "warning");
        connector.reconnect(port);
      } else {
        error121Count = 0;
        dashboard.log("Catched 121 error. But this is 5th try. Give up.", "warning");
        connector.giveUp(port);
      }
    } else {
      dashboard.log("Catched 121 error. But port is invalid.", "error");
    }
  } else {
    dashboard.log("Catched unknown error: \n" + message.toString(), "error");
  }
  originalError(message);
};

import spheroWebSocket from "sphero-websocket";
import argv from "argv";
import config from "./config";
import Dashboard from "./dashboard";
import Scoreboard from "./scoreboard";
import CommandRunner from "./commandRunner";
import Controller from "./controller";
import controllerModel from "./model/controllerModel";
import RankingMaker from "./rankingMaker";
import Connector from "./connector";
import UUIDManager from "./uuidManager";
import publisher from "./publisher";
import SpheroServerManager from "./spheroServerManager";
import VirtualSpheroManager from "./virtualSpheroManager";
import ControllerManager from "./controllerManager";
import appModel from "./appModel";

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;

const spheroWS = spheroWebSocket(config.websocket, isTestMode);

new VirtualSpheroManager(config.virtualSphero.wsPort);

const dashboard = new Dashboard(config.dashboardPort);
dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());

const scoreboard = new Scoreboard(config.scoreboardPort);

new SpheroServerManager(spheroWS);
new ControllerManager();

const rankingMaker = new RankingMaker();

const connector = new Connector();
const uuidManager = new UUIDManager();

publisher.subscribe("named", (author, key, name, isNewName) => {
  const controller = controllerModel.get(name);
  const client = controller.client;

  client.sendCustomMessage("gameState", appModel.gameState);
  client.sendCustomMessage("rankingState", appModel.rankingState);
  client.sendCustomMessage("availableCommandsCount", appModel.availableCommandsCount);
  client.sendCustomMessage("clientKey", key);

  if (isNewName) {
    publisher.subscribe("command", (author, key, commandName, args) => {
      if (controller.linkedOrb !== null) {
        if (!controller.linkedOrb.hasCommand(commandName)) {
          throw new Error(`command : ${commandName} is not valid.`);
        }
        controller.linkedOrb.command(commandName, args);
      }
    });
    controller.on("hp", hp => {
      dashboard.updateHp(name, hp);
    });
  }

  client.on("arriveCustomMessage", (messageName, data, mesID) => {
    if (messageName === "commands") {
      controller.commandRunner.setCommands(data);
    }
  });
});

const orbs = spheroWS.spheroServer.getOrb();
Object.keys(orbs).forEach(orbName => {
  dashboard.addOrb(orbName, orbs[orbName].port);
});


publisher.subscribe("rankingState", (author, state) => {
  const controllerKeys = Object.keys(controllerModel.controllers).filter(key => {
    return controllerModel.get(key).client !== null;
  });
  controllerKeys.forEach(key => {
    controllerModel.get(key).client.sendCustomMessage("rankingState", state);
  });
  if (state === "show") {
    const ranking = rankingMaker.make(controllerModel.controllers);
    controllerKeys.forEach(key => {
      controllerModel.get(key).client.sendCustomMessage("ranking", ranking);
    });
  }
});

publisher.subscribe("updateLink", (author, controllerName, orbName) => {
  controllerModel.get(controllerName).setLink(
    orbName !== null ? spheroWS.spheroServer.getOrb(orbName) : null);
  dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
});
publisher.subscribe("addedOrb", (name, orb) => {
  dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
});
publisher.subscribe("addOrb", (author, name, port) => {
  if (uuidManager.contains(name)) {
    port = uuidManager.getUUID(name);
    console.log("changed!", port);
  }
  const rawOrb = spheroWS.spheroServer.makeRawOrb(name, port);
  if (!isTestMode) {
    if (!connector.isConnecting(port)) {
      error121Count = 0;
      connector.connect(port, rawOrb.instance).then(() => {
        rawOrb.instance.setInactivityTimeout(9999999, function(err, data) {
          console.log(err | "data: " + data);
        });
        dashboard.log("connected orb.", "success");
        rawOrb.instance.configureCollisions({
          meth: 0x01,
          xt: 0x7A,
          xs: 0xFF,
          yt: 0x7A,
          ys: 0xFF,
          dead: 100
        }, () => {
          dashboard.log("configured orb.", "success");
          spheroWS.spheroServer.addOrb(rawOrb);
          rawOrb.instance.streamOdometer();
          rawOrb.instance.on("odometer", data => {
            const time = new Date();
            dashboard.streamed(
              name,
              ("0" + time.getHours()).slice(-2) + ":" +
              ("0" + time.getMinutes()).slice(-2) + ":" +
              ("0" + time.getSeconds()).slice(-2));
          });
        });
      });
    }
  } else {
    spheroWS.spheroServer.addOrb(rawOrb);
  }
});
publisher.subscribe("checkBattery", () => {
  const orbs = spheroWS.spheroServer.getOrb();
  Object.keys(orbs).forEach(orbName => {
    orbs[orbName].instance.getPowerState((error, data) => {
      if (error) {
        throw new Error(error);
      } else {
        dashboard.updateBattery(orbName, data.batteryState);
      }
    });
  });
});
publisher.subscribe("pingAll", () => {
  const orbs = spheroWS.spheroServer.getOrb();
  Object.keys(orbs).forEach(orbName => {
    orbs[orbName].instance.ping((err, data) => {
      if (!err) {
        dashboard.updatePingState(orbName);
      } else {
        dashboard.log("Ping error: \n" + err.toString(), "error");
      }
    });
  });
});
publisher.subscribe("reconnect", (author, name) => {
  if (!isTestMode) {
    const orb = spheroWS.spheroServer.getOrb(name);
    if (orb !== null) {
      console.log("disconnecting...");
      orb.instance.disconnect(() => {
        console.log("disconnected!");
        dashboard.log("(reconnect) disconnected.", "success");
        if (!connector.isConnecting(orb.port)) {
          error121Count = 0;
          dashboard.log("(reconnect) wait 2 seconds.", "log");
          setTimeout(() => {
            dashboard.log("(reconnect) connecting...", "log");
            connector.connect(orb.port, orb.instance).then(() => {
              dashboard.log("(reconnect) connected", "success");
              dashboard.successReconnect(name);
            });
          }, 2000);
        }
      });
    }
  }
});

