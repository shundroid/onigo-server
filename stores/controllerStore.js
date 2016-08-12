import { EventEmitter } from "events";
import subjects from "../subjects";

class ControllerStore extends EventEmitter {
  constructor() {
    super();
    this.unnamedClients = [];
    this.controllers = [];
  }
  getIndexOfControllerName(controllerName) {
    return this.controllers.map(controller => controller.name).indexOf(controllerName);
  }
  getIndexOfClientByKey(key) {
    return this.unnamedClients.map(client => client.key).indexOf(key);
  }
  getUnnamedClientByKey(key) {
    const index = this.getIndexOfClientByKey(key);
    if (index < 0) {
      throw new Error("keyに対するunnamedClientは存在しません。 key: " + key);
    }
    return this.unnamedClients[index];
  }
}

function change(changeStoreItem, nextValue) {
  const prevValue = this[changeStoreItem];
  this[changeStoreItem] = nextValue;
  this.emit(changeStoreItem, prevValue, nextValue);
}
const controllerStore = new ControllerStore();

subjects.unnamedClients.subscribe(unnamedClients => {
  change.call(controllerStore, "unnamedClients", unnamedClients);
});
subjects.controllers.subscribe(controllers => {
  change.call(controllerStore, "controllers", controllers);
});

export default controllerStore;