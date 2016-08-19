import Controller from "./controller";
import CommandRunner from "./commandRunner";
import { EventEmitter } from "events";
import subjects from "./subjects/appSubjects";
import objectValues from "./util/objectValues";

class ControllerModel extends EventEmitter {
  constructor() {
    super();

    // 最初、controllerはunnamedControllerに追加される。
    // name がわかると、それが controllers に移行される。
    // こうすることで、clientが異なっても、nameが同じ場合、HPなどを共有できるようになる。

    // { key: Client, ... }
    this.unnamedClients = {};
    subjects.unnamedClients.subscribe(clients => {
      this.unnamedClients = {};
      clients.forEach(client => {
        this.unnamedClients[client.key] = client;
      });
    });
    // { name: Controller, ... }
    this.controllers = {};
    subjects.controllers.subscribe(controllers => {
      this.controllers = {};
      controllers.forEach(controller => {
        this.controllers[controller.client.key] = controller;
      });
    });
  }
  add(key, client) {
    const nextUnnamedClients = Object.assign({}, this.unnamedClients);
    nextUnnamedClients[key] = client;
    subjects.unnamedClients.publish(objectValues(nextUnnamedClients));
  }
  setName(key, name) {
    if (typeof this.unnamedClients[key] === "undefined") {
      throw new Error("setNameしようとしたところ、keyに対するclientが見つかりませんでした。 key: " + key);
    }
    const nextControllers = Object.assign({}, this.controllers);
    let isNewName = typeof nextControllers[name] === "undefined";
    if (isNewName) {
      nextControllers[name] = new Controller(name, new CommandRunner());
    } else if (nextControllers[name].client !== null) {
      throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + name);
    }
    nextControllers[name].setClient(this.unnamedClients[key]);
    subjects.controllers.publish(objectValues(nextControllers));
    this.removeFromUnnamedClients(key);
    this.emit("named", key, name, isNewName);
  }
  removeFromUnnamedClients(key) {
    if (this.hasInUnnamedClients(key)) {
      const nextUnnamedClients = Object.assign({}, this.unnamedClients);
      delete nextUnnamedClients[key];
      subjects.unnamedClients.publish(objectValues(nextUnnamedClients));
      this.emit("removeUnnamed", key);
    }
  }
  removeClient(name) {
    if (this.has(name)) {
      const nextControllers = Object.assign({}, this.controllers);
      nextControllers[name].setClient(null);
      subjects.controllers.publish(objectValues(nextControllers));
      this.emit("remove", name);
    }
  }
  hasInUnnamedClients(key) {
    return typeof this.unnamedClients[key] !== "undefined";
  }
  has(name) {
    return typeof this.controllers[name] !== "undefined";
  }
  get(name) {
    return this.controllers[name];
  }
  getAllStates() {
    const result = {};
    Object.keys(this.controllers).forEach(name => {
      result[name] = this.controllers[name].getStates();
    });
    return result;
  }
  getUnnamedKeys() {
    return Object.keys(this.unnamedClients);
  }
  toName(key) {
    const nameArray = Object.keys(this.controllers).filter(name => {
      return this.controllers[name].client !== null &&
        this.controllers[name].client.key === key;
    });
    if (nameArray.length === 1) {
      return nameArray[0];
    } else {
      return null;
    }
  }
}

export default ControllerModel;
