var spheroWebSocket = require("sphero-websocket");
var argv = require("argv");
var config = require("./config");
var VirtualSphero = require("sphero-ws-virtual-plugin");
var Dashboard = require("./dashboard");
var CommandRunner = require("./commandRunner");

var opts = [
  { name: "test", type: "boolean" }
];
var isTestMode = argv.option(opts).run().options.test;

var spheroWS = spheroWebSocket(config.websocket, isTestMode);

var virtualSphero = new VirtualSphero(config.virtualSphero.wsPort);
spheroWS.events.on("command", (requestKey, command, args) => {
  virtualSphero.command(command, args);
});

var dashboard = new Dashboard(config.dashboardPort);

var gameState = "inactive";
var availableCommandsCount = 1;

var clients = {};
var players = {};
// key: {commands, timeoutId, playingIndex}
var commands = {};

spheroWS.spheroServer.events.on("addClient", (key, client) => {
  dashboard.addClient(key);
  clients[key] = {
    client: client,
    commandRunner: new CommandRunner(key)
  };
  players[key] = {
    hp: 100
  };
  clients[key].commandRunner.on("command", function(commandName, args) {
    if (client.linkedOrb !== null) {
      if (!client.linkedOrb.hasCommand(commandName)) {
        throw new Error("command : " + commandName + " is not valid.");
      }
      client.linkedOrb.command(commandName, args);
    }
  });
  client.sendCustomMessage("gameState", { gameState: gameState });
  client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  client.on("arriveCustomMessage", (name, data, mesID) => {
    if (name === "commands") {
      if (typeof data.type === "string" && data.type === "built-in") {
        clients[key].commandRunner.setBuiltInCommands(data.command);
      } else {
        clients[key].commandRunner.setCommands(data);
      }
    }
  });
});
spheroWS.spheroServer.events.on("removeClient", key => {
  console.log("removed Client: " + key);
  if (typeof clients[key] !== "undefined") {
    delete clients[key];
  }
  dashboard.removeClient(key);
});

Object.keys(spheroWS.spheroServer.orbs).forEach(orbNames => {
  dashboard.addOrb(orbNames);
});
spheroWS.spheroServer.events.on("addOrb", (name, orb) => {
  if (!isTestMode) {
    orb.detectCollisions();
    orb.on("collision", () => {
      orb.linkedClients.forEach(client => {
        players[client.key].hp -= 10;
        client.sendCustomMessage("hp", { hp: players[client.key].hp });
      });
    });
  }
  dashboard.addOrb(name);
});
spheroWS.spheroServer.events.on("removeOrb", name => {
  dashboard.removeOrb(name);
});

dashboard.on("gameState", state => {
  gameState = state;
  Object.keys(clients).forEach(key => {
    clients[key].client.sendCustomMessage("gameState", { gameState: gameState });
  });
});
dashboard.on("availableCommandsCount", count => {
  availableCommandsCount = count;
  Object.keys(clients).forEach(key => {
    clients[key].client.sendCustomMessage("availableCommandsCount", { count: availableCommandsCount });
  });
});
dashboard.on("updateLink", (key, orbName) => {
  if (orbName === null) {
    clients[key].client.unlink();
  } else {
    clients[key].client.setLinkedOrb(spheroWS.spheroServer.getOrb(orbName));
  }
});

function commandLoop(key, index) {
  var currentCommandDetails = commands[key];
  if (typeof currentCommandDetails === "undefined") {
    throw new Error("実行しようとしたcommandsはundefinedでした。: " + key);
  }
  var currentCommand = currentCommandDetails.commands[index];
  var orb = clients[key].client.linkedOrb;
  if (!orb.hasCommand(currentCommand.commandName)) {
    throw new Error("command " + currentCommand.commandName + " は存在しませんでした。");
  }
  console.log("orb." + currentCommand.commandName + "(" + currentCommand.args.join(", ") + ");");
  if (!isTestMode) {
    var applyArgs = currentCommand.args.slice();
    if (currentCommand.commandName === "roll") {
      applyArgs[0] = players[key].baseSpeed + applyArgs[0];
      applyArgs[1] = (360 + applyArgs[1] + players[key].angle) % 360;
    }
    orb.command(currentCommand.commandName, applyArgs);
  }
  var nextIndex = index + 1 >= currentCommandDetails.commands.length ? 0 : index + 1;
  currentCommandDetails.timeoutId = setTimeout(commandLoop, currentCommand.time * 1000, key, nextIndex);
}

