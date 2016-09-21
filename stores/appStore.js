import { EventEmitter } from "events";
import { subjects } from "../subjects/appSubjects";
import StoreItem from "../util/storeItem";

class AppStore extends EventEmitter {
  constructor() {
    super();
    this.gameState = new StoreItem();
    this.rankingState = new StoreItem();
    this.availableCommandsCount = new StoreItem();
    this.isTestMode = new StoreItem();
  }
}

const appStore = new AppStore();

subjects.gameState.subscribeStore(gameState => {
  appStore.gameState.publish(gameState);
});
subjects.rankingState.subscribeStore(rankingState => {
  appStore.rankingState.publish(rankingState);
});
subjects.availableCommandsCount.subscribeStore(availableCommandsCount => {
  appStore.availableCommandsCount.publish(availableCommandsCount);
});
subjects.isTestMode.subscribeStore(isTestMode => {
  appStore.isTestMode.publish(isTestMode);
});

export default appStore;
