import ko from "knockout";

export default class Controller {
  constructor(appModel, orbModel, controller) {
    this.appModel = appModel;
    this.orbModel = orbModel;

    this.name = ko.observable(controller.name);
    this.key = ko.observable(controller.key);
    this.isOni = ko.observable(controller.isOni);
    this.hp = ko.observable(controller.hp);
    this.orbs = ko.observableArray([]);
    this.colors = ko.observableArray([]);

    this.orbModel.orbs.subscribe(orbs => {
      this.updateOrbs(orbs);
    });
    this.updateOrbs(this.orbModel.orbs())
    this.appModel.colors.subscribe(colors => {
      this.updateColors(colors);
    });
    this.updateColors(this.appModel.colors());
  }
  updateOrbs(orbs) {
    this.orbs.removeAll();
    this.orbs.push.apply(this.orbs, ["- no client -"].concat(orbs.map(orb => orb.name)));
  }
  updateColors(colors) {
    this.colors.removeAll();
    this.colors.push.apply(this.colors, colors);
  }
}