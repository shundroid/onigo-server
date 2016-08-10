import ko from "knockout";

export default class Orbs {
  constructor(orbModel) {
    this.orbModel = orbModel;

    this.addOrbName = ko.observable("");
    this.addOrbPort = ko.observable("");
    this.orbs = ko.observableArray([]);

    this.orbModel.orbs.subscribe(orbs => {
      this.orbs.removeAll();
      this.orbs.push.apply(this.orbs, orbs);
    });

    this.addOrb = () => {
      this.orbModel.addOrb(this.addOrbName(), this.addOrbPort());
    };
    this.checkBattery = () => {
      this.orbModel.checkBattery();
    };
  }
}
