import ko from "knockout";
import eventPublisher from "./publisher";

export default class Controllers {
  constructor() {
    this.controllers = ko.observableArray([]);
    eventPublisher.on("controllers", controllers => {
      this.controllers.removeAll();
      this.controllers.push.apply(this.controllers, controllers);
    });
  }
}
