import appDispatcher from "../dispatcher/appDispatcher";
import constants from "../constants/appConstants";
import { EventEmitter } from "events";

class OrbActions extends EventEmitter {
  constructor() {
    super();
  }
  addUnconnectedOrb(name, port) {
    this.emit("addUnconnectedOrb", name, port);
  }
  removeUnconnectedOrb(name) {
    this.emit("removeUnconnectedOrb", name);
  }
}