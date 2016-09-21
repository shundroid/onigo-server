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
    this.gameState = ko.observable("inactive");
    this.rankingState = ko.observable("hide");
    this.availableCommandsCount = ko.observable(0);

    eventPublisher.on("unnamedClients", unnamedClients => {
      this.unnamedClients(unnamedClients);
    });
    eventPublisher.on("gameState", gameState => {
      this.gameState(gameState);
    });
    eventPublisher.on("rankingState", rankingState => {
      this.rankingState(rankingState);
    });
    eventPublisher.on("availableCommandsCount", availableCommandsCount => {
      this.availableCommandsCount(availableCommandsCount);
    });
  }
  toggleGameState() {
    eventPublisher.emit("gameState", this.gameState() === "inactive" ? "active" : "inactive");
  }
  setAvailableCommandsCount(count) {
    eventPublisher.emit("availableCommandsCount", count);
  }
}
