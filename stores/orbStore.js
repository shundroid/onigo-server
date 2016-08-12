import { EventEmitter } from "events";
import subjects from "../subjects";

class OrbStore extends EventEmitter {
  constructor() {
    super();
    this.unconnectedOrbs = [];
    this.orbs = [];
  }
}
function change(changeStoreItem, nextValue) {
  const prevValue = this[changeStoreItem];
  this[changeStoreItem] = nextValue;
  this.emit(changeStoreItem, prevValue, nextValue);
}
const orbStore = new OrbStore();

subjects.notifications.subscribe(notification => {
  if (notification.type === "addOrb") {
    const nextUnconnectedOrbs = orbStore.unconnectedOrbs.slice(0);
    nextUnconnectedOrbs.push({
      name: notification.orbName,
      port: notification.orbPort
    });
    change.call(orbStore, "unconnectedOrbs", nextUnconnectedOrbs);
  }
});
subjects.orbs.subscribe(orbs => {
  change.call(orbStore, "orbs", orbs);
});

export default orbStore;