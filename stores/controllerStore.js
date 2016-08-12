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
}
const controllerStore = new ControllerStore();

subjects.unnamedClients.subscribe(unnamedClients => {
  controllerStore.change("unnamedClients", unnamedClients);
});

export default controllerStore;