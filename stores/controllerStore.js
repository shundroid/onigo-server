import { EventEmitter } from "events";
import subjects from "../subjects";

class ControllerStore extends EventEmitter {
  constructor() {
    super();
    this.unnamedClients = [];
    this.controllers = [];
  }
  change(changeStoreItem, nextValue) {
    const prevValue = this[changeStoreItem];
    this[changeStoreItem] = nextValue;
    this.emit(changeStoreItem, prevValue, nextValue);
  }
  getIndexOfControllerName(controllerName) {
    return this.controllers.map(controller => controller.name).indexOf(controllerName);
  }
  getUnnamedClientByKey(key) {
    const index = this.unnamedClients.map(client => client.key).indexOf(key);
    if (index < 0) {
      throw new Error("keyに対するunnamedClientは存在しません。 key: " + key);
    }
    return this.unnamedClients[index];
  }
}
const controllerStore = new ControllerStore();

subjects.unnamedClients.subscribe(unnamedClients => {
  controllerStore.change("unnamedClients", unnamedClients);
});
subjects.controllers.subscribe(controllers => {
  controllerStore.change("controllers", controllers);
});

export default controllerStore;