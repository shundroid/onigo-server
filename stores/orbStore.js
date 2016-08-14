import { EventEmitter } from "events";
import subjects from "../subjects";
import StoreItem from "../util/storeItem";

class OrbStore extends EventEmitter {
  constructor() {
    super();
    this.unconnectedOrbs = new StoreItem([]);
    this.orbs = new StoreItem([]);
  }
}

const orbStore = new OrbStore();

subjects.notifications.subscribe(notification => {
  if (notification.type === "addOrb") {
    const nextUnconnectedOrbs = orbStore.unconnectedOrbs.get().slice(0);
    nextUnconnectedOrbs.push({
      name: notification.orbName,
      port: notification.orbPort
    });
    orbStore.unconnectedOrbs.publish(nextUnconnectedOrbs);
  }
});
subjects.orbs.subscribe(orbs => {
  orbStore.orbs.publish(orbs);
});

export default orbStore;