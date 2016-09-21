import ko from "knockout";

export default class AppViewModel {
  constructor(appModel) {
    this.appModel = appModel;

    this.gameState = ko.observable("inactive");
    this.rankingState = ko.observable("hide");
    this.availableCommandsCount = ko.observable(1);

    this.appModel.gameState.subscribe(gameState => this.gameState(gameState));
    this.appModel.rankingState.subscribe(rankingState => this.rankingState(rankingState));
    this.appModel.availableCommandsCount.subscribe(count => this.availableCommandsCount(count));

    this.rankingStateButtonCaption = ko.computed(() => {
      return this.rankingState() === "show" ? "Hide Ranking" : "Show Ranking";
    });
    this.gameStateButtonCaption = ko.computed(() => {
      return this.gameState().toUpperCase();
    });

    this.toggleGameState = () => {
      this.appModel.toggleGameState();
    };
    this.setAvailableCommandsCount = () => {
      this.appModel.setAvailableCommandsCount(parseInt(this.availableCommandsCount()));
    };
  }
}
