import subjects from "../subjects";
import Controller from "../controller";
import CommandRunner from "../commandRunner";
import arrayDiff from "../util/arrayDiff";
import controllerStore from "../stores/controllerStore";

export default class ControllerManager {
  constructor(spheroServer) {
    // this.unnamedClients = new Map();
    // this.controllers = new Map();
    this.spheroServer = spheroServer;

    this.spheroServer.events.on("addClient", (key, client) => {
      this.addUnnamedClient(client);
    });
    this.spheroServer.events.on("removeClient", key => {
      this.removeUnnamedClient(key);
    });

    controllerStore.on("unnamedClients", (prevUnnamedClients, nextUnnamedClients) => {
      const diff = arrayDiff.getDiff(prevUnnamedClients, nextUnnamedClients);
      diff.added.forEach(client => {
        client.on("arriveCustomMessage", (name, data) => {
          if (/^(requestName|useDefinedName)$/.test(name)) {
            this.processRequestName(name, client, data);
          }
        });
      });
    });
    controllerStore.on("controllers", controllers => {
      // Todo
    });
  }
  addUnnamedClient(client) {
    const nextUnnamedClients = controllerStore.unnamedClients.slice(0);
    nextUnnamedClients.push(client);
    subjects.unnamedClients.publish(nextUnnamedClients);
  }
  removeUnnamedClient(key) {
    const nextUnnamedClients = controllerStore.unnamedClients.slice(0);
    nextUnnamedClients.splice(controllerStore.getIndexOfClientByKey(key), 1);
    subjects.unnamedClients.publish(nextUnnamedClients);
  }
  // controllers に add して、unnamedClients から remove する
  setName(key, name) {
    const nextControllers = controllerStore.controllers.slice(0);
    let controllerIndex = controllerStore.getIndexOfControllerName(name);
    if (controllerIndex < 0) {
      controllerIndex = nextControllers.length;
      nextControllers.push(new Controller(name, new CommandRunner()));
    } else if (nextControllers[controllerIndex].client !== null) {
      throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + name);
    }
    nextControllers[controllerIndex].setClient(controllerStore.getUnnamedClientByKey(key));
    subjects.controllers.publish(nextControllers);
    const nextUnnamedClients = controllerStore.unnamedClients.slice(0);
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