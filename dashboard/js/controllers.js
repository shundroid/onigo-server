import ko from "knockout";
import eventPublisher from "./publisher";

export default function Controllers() {
  this.controllers = ko.observableArray([]);
  eventPublisher.on("controllers", controllers => {
    this.controllers.removeAll();
    this.controllers.push.apply(this.controllers, controllers);
  });
}
