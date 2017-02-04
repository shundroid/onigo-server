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
import VirtualSphero from "sphero-ws-virtual-plugin";
import Dashboard from "./dashboard";
import Scoreboard from "./scoreboard";
import CommandRunner from "./commandRunner";
import Controller from "./controller";
import controllerModel from "./controllerModel";
import RankingMaker from "./rankingMaker";
import Connector from "./connector";
import eventPublisher from "./publisher";
import PortManager from "./portManager";

const opts = [
  { name: "test", type: "boolean" }
];
const isTestMode = argv.option(opts).run().options.test;

const spheroWS = spheroWebSocket(config.websocket, isTestMode);

const virtualSphero = new VirtualSphero(config.virtualSphero.wsPort);

const dashboard = new Dashboard(config.dashboardPort);
//dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());

const scoreboard = new Scoreboard(config.scoreboardPort);

let gameState = "inactive";
let rankingState = "hide";
let availableCommandsCount = 1;

const rankingMaker = new RankingMaker();

const connector = new Connector();

const portManager = new PortManager();

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  controllerModel.add(key, client);
  client.on("arriveCustomMessage", (name, data, mesID) => {
    // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
    // requestNameとuseDefinedNameを分けている。
    // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
    // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
    if (name === "requestName") {
      if (controllerModel.has(data)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        controllerModel.setName(key, data);
        client.sendCustomMessage("acceptName", data);
      }
    } else if (name === "useDefinedName") {
      if (!controllerModel.has(data)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        controllerModel.setName(key, data);
        client.sendCustomMessage("acceptName", data);
      }
    }
  });
});

spheroWS.spheroServer.events.on("removeClient", key => {
  if (controllerModel.hasInUnnamedClients(key)) {
    controllerModel.removeFromUnnamedClients(key);
  } else {
    const name = controllerModel.toName(key);
    controllerModel.removeClient(name);
    virtualSphero.removeSphero(name);
  }
});

controllerModel.on("named", (key, name, isNewName) => {
  const controller = controllerModel.get(name);
  const client = controller.client;

  client.sendCustomMessage("gameState", gameState);
  client.sendCustomMessage("rankingState", rankingState);
  client.sendCustomMessage("availableCommandsCount", availableCommandsCount);
  client.sendCustomMessage("clientKey", key);

  if (isNewName) {
    controller.commandRunner.on("command", (commandName, args) => {
      if (controller.linkedOrbName !== null) {
        portManager.runCommand(controller.linkedOrbName, commandName, ...args);
      }
      virtualSphero.command(name, commandName, args);
    });
    controller.on("hp", hp => {
      dashboard.updateHp(name, hp);
    });
  }
  virtualSphero.addSphero(name);

  client.on("arriveCustomMessage", (messageName, data, mesID) => {
    if (messageName === "commands") {
      controller.commandRunner.setCommands(data);
    }
  });
});

portManager.getSpheros();
portManager.connect(8085);

portManager.on("updateOrb", (orbs) => {
  orbs.forEach(({ name, port }) => {
    dashboard.addOrb(name, port);
  });
});
/*spheroWS.spheroServer.events.on("roveOrb", name => {
  dashboard.removeOrb(name);
});*/

dashboard.on("gameState", state => {
  gameState = state;
  Object.keys(controllerModel.controllers).filter(key => {
    return controllerModel.get(key).client !== null;
  }).forEach(key => {
    controllerModel.get(key).client.sendCustomMessage("gameState", gameState);
  });
});
dashboard.on("rankingState", state => {
  const controllerKeys = Object.keys(controllerModel.controllers).filter(key => {
    return controllerModel.get(key).client !== null;
  });
  rankingState = state;
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

dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(controllerModel.controllers).forEach(name => {
    const client = controllerModel.get(name).client;
    if (client !== null) {
      client.sendCustomMessage("availableCommandsCount", availableCommandsCount);
    }
  });
});
dashboard.on("updateLink", (controllerName, orbName) => {
  controllerModel.get(controllerName).setLink(
    orbName !== null ? spheroWS.spheroServer.getOrb(orbName) : null);
  //dashboard.updateUnlinkedOrbs(spheroWS.spheroServer.getUnlinkedOrbs());
  eventPublisher.emit("updateLink", controllerName, orbName);
});
dashboard.on("addOrb", (name, port) => {
  portManager.addOrb(name, port);
});
dashboard.on("removeOrb", name => {
  portManager.removeOrb(name);
});
dashboard.on("oni", (name, enable) => {
  controllerModel.get(name).setIsOni(enable);
});
dashboard.on("checkBattery", () => {
/**  const orbs = spheroWS.spheroServer.getOrb();
  Object.keys(orbs).forEach(orbName => {
    orbs[orbName].instance.getPowerState((error, data) => {
      if (error) {
        throw new Error(error);
      } else {
        dashboard.updateBattery(orbName, data.batteryState);
      }
    });
  });*/
});
dashboard.on("resetHp", name => {
  const controller = controllerModel.get(name);
  controller.setHp(100);
  eventPublisher.emit("updatedHp", controller);
});
dashboard.on("pingAll", () => {
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
dashboard.on("reconnect", name => {
/**  if (!isTestMode) {
    const orb = spheroWS.spheroServer.getOrb(name);
    if (orb !== null) {
      orb.instance.disconnect(() => {
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
  }*/
});
dashboard.on("color", (name, color) => {
  controllerModel.get(name).setColor(color);
  eventPublisher.emit("color", name, color);
});

