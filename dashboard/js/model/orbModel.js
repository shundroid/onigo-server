import ko from "knockout";
import eventPublisher from "../publisher";

export default class OrbModel {
  constructor() {
    this.orbs = ko.observableArray([]);

    eventPublisher.on("orbs", orbs => {
      this.orbs(orbs);
    });
  }
  addOrb(orbName, orbPort) {
    eventPublisher.emit("notifications", {
      type: "addOrb",
      name: orbName,
      port: orbPort
    });
  }
  checkBattery() {
    eventPublisher.emit("notifications", {
      type: "checkBattery"
    });
  }
}