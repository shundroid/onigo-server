import ko from "knockout";
import Controller from "./controller";

export default class Controllers {
  constructor(appModel, orbModel, controllerModel) {
    this.appModel = appModel;
    this.orbModel = orbModel;
    this.controllerModel = controllerModel;

    this.controllers = ko.observableArray([]);

    this.controllerModel.controllers.subscribe(controllers => {
      this.controllers.removeAll();
      this.controllers.push.apply(this.controllers, controllers.map(controller => {
        return new Controller(this.appModel, this.orbModel, this.controllerModel, controller);
      }));
    });
  }
}
