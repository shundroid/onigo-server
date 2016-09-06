import ko from "knockout";

const unlinkedLabel = "- unlinked -";

export default class Controller {
  constructor(appModel, orbModel, controllerModel, controller) {
    this.appModel = appModel;
    this.orbModel = orbModel;
    this.controllerModel = controllerModel;

    this.name = ko.observable(controller.name);
    this.key = ko.observable(controller.key);
    this.isOni = ko.observable(controller.isOni);
    this.hp = ko.observable(controller.hp);
    this.link = ko.observable(controller.link === null ? unlinkedLabel : controller.link);
    this.orbs = ko.observableArray([]);
    this.colors = ko.observableArray([]);

    this.orbModel.orbs.subscribe(orbs => {
      updateOrbs.call(this, orbs);
    });
    updateOrbs.call(this, this.orbModel.orbs())
    this.appModel.colors.subscribe(colors => {
      updateColors.call(this, colors);
    });
    updateColors.call(this, this.appModel.colors());

    this.updateLink = () => {
      this.controllerModel.updateLink(this.name(), this.link() === unlinkedLabel ? null : this.link());
    };
  }
}

// private methods
function updateOrbs(orbs) {
  this.orbs([unlinkedLabel].concat(orbs.map(orb => orb.name)))
}

function updateColors(colors) {
  this.colors(colors);
}