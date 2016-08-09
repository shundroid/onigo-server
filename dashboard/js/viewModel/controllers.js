import ko from "knockout";
import Controller from "./controller";

export default class Controllers {
  constructor(appModel, orbModel) {
    this.appModel = appModel;
    this.orbModel = orbModel;

    this.controllers = ko.observableArray([]);

    this.appModel.controllers.subscribe(controllers => {
      this.controllers.removeAll();
      this.controllers.push.apply(this.controllers, controllers.map(controller => {
        return new Controller(this.appModel, this.orbModel, controller);
      }));
    });
  }
}
