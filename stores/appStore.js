import { EventEmitter } from "events";
import subjects from "../subjects/appSubjects";
import StoreItem from "../util/storeItem";

class AppStore extends EventEmitter {
  constructor() {
    super();
    this.gameState = new StoreItem("inactive");
    this.rankingState = new StoreItem("hide");
    this.availableCommandsCount = new StoreItem(1);
  }
}

const appStore = new AppStore();

subjects.gameState.subscribe(gameState => {
  appStore.gameState.publish(gameState);
});
subjects.rankingState.subscribe(rankingState => {
  appStore.rankingState.publish(rankingState);
});
subjects.availableCommandsCount.subscribe(availableCommandsCount => {
  appStore.availableCommandsCount.publish(availableCommandsCount);
});

export default appStore;