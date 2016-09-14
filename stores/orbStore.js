import { EventEmitter } from "events";
import subjects from "../subjects/appSubjects";
import StoreItem from "../util/storeItem";
import Orb from "../orb";

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
// subjects.orbs.subscribe(orbs => {
//   orbStore.orbs.publish(orbs);
// });

export default orbStore;