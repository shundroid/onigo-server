import { subjects } from "../subjects/appSubjects";
import Controller from "../controller";
import CommandRunner from "../commandRunner";
import arrayDiff from "../util/arrayDiff";
import controllerStore from "../stores/controllerStore";
import appStore from "../stores/appStore";
import orbStore from "../stores/orbStore";
import MiddlewareBase from "./middlewareBase";

export default class ControllerManager extends MiddlewareBase {
  constructor(spheroServer) {
    super();
    this.spheroServer = spheroServer;
    spheroServer.events.on("addClient", (key, client) => {
      subjects.addClient.publish({
        key,
        client  
      });
    });
    spheroServer.events.on("removeClient", key => {
      subjects.removeClient.publish(key);
    });

    this.defineObserver("addClient", (clientDetails, next) => {
      const client = clientDetails.client;
      client.on("arriveCustomMessage", (name, data) => {
        if (/^(requestName|useDefinedName)$/.test(name)) {
          this.processRequestName(name, client, data);
        }
      });
      // virtualSphero.addSphero
      next(clientDetails);
    });
    this.defineObserver("removeClient", (key, next) => {
      // virtualSphero.removeSphero
      next(key);
    });
    this.defineObserver("setNameClient", (clientDetails, next, error) => {
      const nextDetails = clientDetails;
      let controllerIndex = controllerStore.getIndexOfControllerName(clientDetails.name);
      let targetController;
      if (controllerIndex < 0) {
        controllerIndex = controllerStore.controllers.get().length;
        targetController = new Controller(clientDetails.name, new CommandRunner());
        nextDetails.controller = targetController;
        targetController.commandRunner.on("command", (commandName, args) => {
          // これも subjects.command みたいな subject にして、その中でやりたい
          if (controller.linkedOrb !== null) {
            if (!controller.linkedOrb.hasCommand(commandName)) {
              throw new Error(`command : ${commandName} is not valid.`);
            }
            controller.linkedOrb.command(commandName, args);
          }
          virtualSphero.command(name, commandName, args);
        });
        targetController.on("hp", hp => {
          // dashboard.updateHp(name, hp);
        });
      }
      const client = controllerStore.getUnnamedClientByKey(clientDetails.key);
      client.sendCustomMessage("gameState", appStore.gameState.get());
      client.sendCustomMessage("rankingState", appStore.rankingState.get());
      client.sendCustomMessage("availableCommandsCount", appStore.availableCommandsCount.get());
      client.sendCustomMessage("clientKey", client.key);
      client.on("arriveCustomMessage", (messageName, data) => {
        if (messageName === "commands") {
          controller.commandRunner.setCommands(data);
        }
      });
      next(nextDetails);
    });
    this.defineObserver("gameState", (gameState, next) => {
      const clients = controllerStore.controllers.get()
        .filter(controller => controller.client !== null)
        .map(controller => controller.client);

      clients.forEach(client => {
        client.sendCustomMessage("gameState", gameState);
      });
      next(gameState);
    });
    this.defineObserver("availableCommandsCount", (count, next) => {
      const clients = controllerStore.controllers.get()
        .filter(controller => controller.client !== null)
        .map(controller => controller.client);

      console.log(count);

      clients.forEach(client => {
        client.sendCustomMessage("availableCommandsCount", count);
      });
      next(count);
    });
  }
  // controllers に add して、unnamedClients から remove する
  setName(key, name) {
    subjects.setNameClient.publish({ key, name });
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
