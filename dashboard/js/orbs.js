import ko from "knockout";
import eventPublisher from "./publisher";

export default class Orbs {
  constructor() {
    this.addOrbName = ko.observable("");
    this.addOrbPort = ko.observable("");
    this.orbs = ko.observableArray([]);
    this.addOrb = () => {
      eventPublisher.emit("notifications", {
        type: "addOrb",
        orbName: this.addOrbName(),
        orbPort: this.addOrbPort()
      });
    };
    this.checkBattery = () => {
      eventPublisher.emit("notifications", {
        type: "checkBattery"
      });
    };
    eventPublisher.on("orbs", orbs => {
      this.orbs.removeAll();
      this.orbs.push.apply(this.orbs, orbs);
    });
  }
}