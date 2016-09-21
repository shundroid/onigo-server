import { EventEmitter } from "events";
import { subjects } from "../subjects/appSubjects";
import StoreItem from "../util/storeItem";
import CommandRunner from "../commandRunner";
import orbStore from "./orbStore";

class ControllerStore extends EventEmitter {
  constructor() {
    super();
    this.unnamedClients = new StoreItem([]);
    this.controllers = new StoreItem([]);
  }
  getIndexOfControllerName(controllerName) {
    return this.controllers.get().map(controller => controller.name).indexOf(controllerName);
  }
  getIndexOfClientByKey(key) {
    return this.unnamedClients.get().map(client => client.key).indexOf(key);
  }
  getUnnamedClientByKey(key) {
    const index = this.getIndexOfClientByKey(key);
    if (index < 0) {
      throw new Error("keyに対するunnamedClientは存在しません。 key: " + key);
    }
    return this.unnamedClients.get()[index];
  }
  getLinkControllers(link) {
    return this.controllers.get().filter(controller => {
      return controller.linkedOrb !== null && controller.linkedOrb.name === link;
    });
  }
}

const controllerStore = new ControllerStore();

subjects.addClient.subscribeStore(clientDetails => {
  const nextUnnamedClients = controllerStore.unnamedClients.get().slice(0);
  nextUnnamedClients.push(clientDetails.client);
  controllerStore.unnamedClients.publish(nextUnnamedClients);
});
subjects.removeClient.subscribeStore(key => {
  if (controllerStore.getIndexOfClientByKey(key) < 0) {
    const nextControllers = controllerStore.controllers.get().slice(0);
    nextControllers.filter(controller =>
      controller.client !== null && controller.client.key === key).forEach(controller => {
      controller.setClient(null);
    });
    controllerStore.controllers.publish(nextControllers);
  } else {
    const nextUnnamedClients = controllerStore.unnamedClients.get().slice(0);
    const unnamedClientKeys = nextUnnamedClients.map(client => client.key);
    nextUnnamedClients.splice(unnamedClientKeys.indexOf(key), 1);
    controllerStore.unnamedClients.publish(nextUnnamedClients);
  }
});
subjects.setNameClient.subscribeStore(clientDetails => {
  let controllerIndex = controllerStore.getIndexOfControllerName(clientDetails.name);
  const nextControllers = controllerStore.controllers.get().slice(0);
  if (typeof clientDetails.controller !== "undefined") {
    controllerIndex = nextControllers.length;
    nextControllers.push(clientDetails.controller);
  } else if (nextControllers[controllerIndex].client !== null) {
    throw new Error("setNameしようとしましたが、既にclientが存在します。 name: " + clientDetails.name);
  }
  nextControllers[controllerIndex].setClient(controllerStore.getUnnamedClientByKey(clientDetails.key));
  controllerStore.controllers.publish(nextControllers);

  const nextUnnamedClients = controllerStore.unnamedClients.get().slice(0);
  const unnamedClientKeys = nextUnnamedClients.map(client => client.key);
  nextUnnamedClients.splice(unnamedClientKeys.indexOf(clientDetails.key), 1);
  controllerStore.unnamedClients.publish(nextUnnamedClients);
});
subjects.updateLink.subscribeStore(linkDetails => {
  const controllers = controllerStore.controllers.get();
  const controllerIndex = controllerStore.getIndexOfControllerName(linkDetails.controllerName);
  if (linkDetails.link !== null) {
    const orb = orbStore.orbs.get()[orbStore.getIndexOfOrbName(linkDetails.link)];
    controllers[controllerIndex].setLink(orb.swOrb);
  } else {
    controllers[controllerIndex].setLink(null);
  }
  controllerStore.controllers.publish(controllers);
});
export default controllerStore;
