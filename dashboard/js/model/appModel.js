import ko from "knockout";
import eventPublisher from "../publisher";

export default class AppModel {
  constructor() {
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

    eventPublisher.on("unnamedClients", unnamedClients => {
      this.unnamedClients.removeAll();
      this.unnamedClients.push.apply(this.unnamedClients, unnamedClients);
    });
  }
}