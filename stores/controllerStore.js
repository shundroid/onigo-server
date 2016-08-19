import { EventEmitter } from "events";
import subjects from "../subjects/appSubjects";
import StoreItem from "../util/storeItem";

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
}

const controllerStore = new ControllerStore();

subjects.unnamedClients.subscribe(unnamedClients => {
  controllerStore.unnamedClients.publish(unnamedClients);
});
subjects.controllers.subscribe(controllers => {
  controllerStore.controllers.publish(controllers);
});

export default controllerStore;