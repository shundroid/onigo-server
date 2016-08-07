import subjects from "./subjects";
import Controller from "./controller";
import CommandRunner from "./commandRunner";
import arrayDiff from "./util/arrayDiff";

export default class ControllerManager {
  constructor(spheroServer) {
    this.unnamedClients = new Map();
    this.controllers = new Map();
    this.spheroServer = spheroServer;

    this.spheroServer.events.on("addClient", (key, client) => {
      this.addUnnamedClient(key, client);
    });

    subjects.unnamedClients.subscribe(unnamedClients => {
      const diff = arrayDiff.getDiff([...this.unnamedClients.values()], unnamedClients);
      diff.added.forEach(client => {
        this.unnamedClients.set(client.key, client);
        client.on("arriveCustomMessage", (name, data) => {
          if (/^(requestName|useDefinedName)$/.test(name)) {
            this.processRequestName(name, client, data);
          }
        });
      });
      diff.removed.forEach(client => {
        this.unnamedClients.delete(client.key);
      });
    });
  }
  addUnnamedClient(key, client) {
    const nextUnnamedClients = new Map(this.unnamedClients);
    nextUnnamedClients.set(key, client);
    subjects.unnamedClients.publish([...nextUnnamedClients.values()]);
  }
  // controllers に add して、unnamedClients から remove する
  setName(key, name) {
    const nextControllers = new Map(this.controllers);
    if (!nextControllers.has(name)) {
      nextControllers.set(name, new Controller(name, new CommandRunner()));
    } else if (nextControllers.get(name).client !== null) {
      throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + name);
    }
    nextControllers.get(name).setClient(this.unnamedClients.get(key));
    subjects.controllers.publish([...nextControllers.values()]);
    const nextUnnamedClients = new Map(this.unnamedClients);
    nextUnnamedClients.delete(key);
    subjects.unnamedClients.publish([...nextUnnamedClients.values()]);
  }
  processRequestName(messageType, client, name) {
    // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
    // requestNameとuseDefinedNameを分けている。
    // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
    // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
    if (messageType === "requestName") {
      if (this.controllers.has(name)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        this.setName(client.key, name);
        client.sendCustomMessage("acceptName", name);
      }
    } else if (messageType === "useDefinedName") {
      if (!this.controllers.has(name)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        this.setName(client.key, name);
        client.sendCustomMessage("acceptName", name);
      }
    }
  }
}