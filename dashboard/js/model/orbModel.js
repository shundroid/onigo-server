import ko from "knockout";
import eventPublisher from "../publisher";

export default class OrbModel {
  constructor() {
    this.orbs = ko.observableArray([]);

    eventPublisher.on("orbs", orbs => {
      this.orbs.removeAll();
      this.orbs.push.apply(this.orbs, orbs);
    });

    this.addOrb = (orbName, orbPort) => {
      eventPublisher.emit("notifications", {
        type: "addOrb",
        orbName: orbName,
        orbPort: orbPort
      });
    };
    this.checkBattery = () => {
      eventPublisher.emit("notifications", {
        type: "checkBattery"
      });
    };
  }
}