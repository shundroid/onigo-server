import ko from "knockout";
import eventPublisher from "../publisher";

export default class ControllerModel {
  constructor() {
    this.controllers = ko.observableArray([]);

    eventPublisher.on("controllers", controllers => {
      this.controllers(controllers);
    });
  }
  updateLink(controllerName, link) {
    const nextControllers = this.controllers();
    const controllerIndexOf =
      nextControllers.map(controller => controller.name).indexOf(controllerName);
    if (controllerIndexOf < 0) {
      throw new Error("updateLinkしようとしたcontrollerはありませんでした。 : " + controllerName);
    }
    nextControllers[controllerIndexOf].link = link;
    eventPublisher.emit("controllers", nextControllers);
    eventPublisher.emit("notifications", {
      type: "updateLink",
      controllerName, link
    });
  }
}
