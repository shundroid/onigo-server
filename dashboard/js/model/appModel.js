import ko from "knockout";
import eventPublisher from "../publisher";

export default class AppModel {
  constructor() {
    this.controllers = ko.observableArray([]);
    this.unnamedClients = ko.observableArray([]);
    this.colors = ko.observableArray([
      "red",
      "coral",
      "green",
      "yellow",
      "blue",
      "purple",
      "skyblue"
    ]);

    eventPublisher.on("controllers", controllers => {
      this.controllers.removeAll();
      this.controllers.push.apply(this.controllers, controllers);
    });
    eventPublisher.on("unnamedClients", unnamedClients => {
      this.unnamedClients.removeAll();
      this.unnamedClients.push.apply(this.unnamedClients, unnamedClients);
    });
  }
}