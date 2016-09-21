import { EventEmitter } from "events";
import { subjects } from "../subjects/appSubjects";
import StoreItem from "../util/storeItem";
import Orb from "../orb";
import controllerStore from "./controllerStore";

class OrbStore extends EventEmitter {
  constructor() {
    super();
    this.orbs = new StoreItem([]);
  }
  getIndexOfOrbName(name) {
    return this.orbs.get().map(orb => orb.swOrb.name).indexOf(name);
  }
}

const orbStore = new OrbStore();

subjects.addOrb.subscribeStore(orb => {
  const nextOrbs = orbStore.orbs.get().slice(0);
  nextOrbs.push(orb);
  orbStore.orbs.publish(nextOrbs);
});
subjects.updateLink.subscribeStore(linkDetails => {
  if (linkDetails.link !== null) {
    const orb = orbStore.orbs.get()[orbStore.getIndexOfOrbName(linkDetails.link)];
    if (!orb.isLinked) {
      orb.isLinked = true;
      orbStore.orbs.publish(orbStore.orbs.get());
    }
  } else {
    const controllerIndex = controllerStore.getIndexOfControllerName(linkDetails.controllerName);
    const linkedOrb = controllerStore.controllers.get()[controllerIndex].linkedOrb;
    if (linkedOrb !== null && controllerStore.getLinkControllers(linkedOrb.name).length === 0) {
      const orb = orbStore.orbs.get()[orbStore.getIndexOfOrbName(linkedOrb.name)];
      orb.isLinked = false;
      orbStore.orbs.publish(orbStore.orbs.get());
    }
  }
});

export default orbStore;
