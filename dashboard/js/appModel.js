import eventPublisher from "./publisher";

export class AppModel {
  constructor() {
    this.gameState = "";
    this.rankingState = "hide";

    eventPublisher.on("gameState", state => {
      this.gameState = state;
    });
    eventPublisher.on("rankingState", state => {
      this.rankingState = state;
    });
  }
  toggleGameState() {
    switch (this.gameState) {
    case "active":
      eventPublisher.emit("gameState", "inactive");
      break;
    case "inactive":
      eventPublisher.emit("gameState", "active");
      break;
    default:
      throw new Error("tryed to toggle gameState but gameState is invalid. gameState: " + this.gameState);
    }
  }
  toggleRankingState() {
    switch (this.rankingState) {
    case "show":
      eventPublisher.emit("rankingState", "hide");
      break;
    case "hide":
      eventPublisher.emit("rankingState", "show");
      break;
    default:
      throw new Error("tryed to toggle rankingState but rankingState is invalid. rankingState: " + this.gameState);
    }
  }
}

export default new AppModel();