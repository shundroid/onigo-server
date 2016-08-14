import subjects from "../subjects";
import Controller from "../controller";
import CommandRunner from "../commandRunner";
import arrayDiff from "../util/arrayDiff";
import controllerStore from "../stores/controllerStore";
import appStore from "../stores/appStore";

export default class ControllerManager {
  constructor(spheroServer) {
    this.spheroServer = spheroServer;

    this.spheroServer.events.on("addClient", (key, client) => {
      this.addUnnamedClient(client);
    });
    this.spheroServer.events.on("removeClient", key => {
      this.removeUnnamedClient(key);
    });

    controllerStore.unnamedClients.subscribe(nextUnnamedClients => {
      const diff = arrayDiff.getDiff(controllerStore.unnamedClients.get(), nextUnnamedClients);
      diff.added.forEach(client => {
        client.on("arriveCustomMessage", (name, data) => {
          if (/^(requestName|useDefinedName)$/.test(name)) {
            this.processRequestName(name, client, data);
          }
        });
      });
    });
    controllerStore.controllers.subscribe(nextControllers => {
      const diff = arrayDiff.getDiff(controllerStore.controllers.get(), nextControllers);
      diff.added.concat(diff.noChanged).forEach(controller => {
        const client = controller.client;
        if (client !== null) {
          client.sendCustomMessage("gameState", appStore.gameState.get());
          client.sendCustomMessage("rankingState", appStore.rankingState.get());
          client.sendCustomMessage("availableCommandsCount", appStore.availableCommandsCount.get());
          client.sendCustomMessage("clientKey", client.key);
          client.on("arriveCustomMessage", (messageName, data) => {
            if (messageName === "commands") {
              controller.commandRunner.setCommands(data);
            }
          });
        }
      });
      diff.added.forEach(controller => {
        controller.commandRunner.on("command", (commandName, args) => {
          if (controller.linkedOrb !== null) {
            if (!controller.linkedOrb.hasCommand(commandName)) {
              throw new Error(`command : ${commandName} is not valid.`);
            }
            controller.linkedOrb.command(commandName, args);
          }
          virtualSphero.command(name, commandName, args);
        });
        controller.on("hp", hp => {
          // dashboard.updateHp(name, hp);
        });
      });
    });
  }
  addUnnamedClient(client) {
    const nextUnnamedClients = controllerStore.unnamedClients.get().slice(0);
    nextUnnamedClients.push(client);
    subjects.unnamedClients.publish(nextUnnamedClients);
  }
  removeUnnamedClient(key) {
    const nextUnnamedClients = controllerStore.unnamedClients.get().slice(0);
    nextUnnamedClients.splice(controllerStore.getIndexOfClientByKey(key), 1);
    subjects.unnamedClients.publish(nextUnnamedClients);
  }
  // controllers に add して、unnamedClients から remove する
  setName(key, name) {
    const nextControllers = controllerStore.controllers.get().slice(0);
    let controllerIndex = controllerStore.getIndexOfControllerName(name);
    if (controllerIndex < 0) {
      controllerIndex = nextControllers.length;
      nextControllers.push(new Controller(name, new CommandRunner()));
    } else if (nextControllers[controllerIndex].client !== null) {
      throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + name);
    }
    nextControllers[controllerIndex].setClient(controllerStore.getUnnamedClientByKey(key));
    subjects.controllers.publish(nextControllers);
    const nextUnnamedClients = controllerStore.unnamedClients.get().slice(0);
    const unnamedClientKeys = nextUnnamedClients.map(client => client.key);
    nextUnnamedClients.splice(unnamedClientKeys.indexOf(key), 1);
    subjects.unnamedClients.publish(nextUnnamedClients);
  }
  processRequestName(messageType, client, name) {
    // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
    // requestNameとuseDefinedNameを分けている。
    // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
    // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
    const controllerNameIndex = controllerStore.getIndexOfControllerName(name);
    if (messageType === "requestName") {
      if (controllerNameIndex >= 0) {
        client.sendCustomMessage("rejectName", null);
      } else {
        this.setName(client.key, name);
        client.sendCustomMessage("acceptName", name);
      }
    } else if (messageType === "useDefinedName") {
      if (controllerNameIndex < 0) {
        client.sendCustomMessage("rejectName", null);
      } else {
        this.setName(client.key, name);
        client.sendCustomMessage("acceptName", name);
      }
    }
  }
}