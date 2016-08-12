import { EventEmitter } from "events";
import subjects from "../subjects";

class AppStore extends EventEmitter {
  constructor() {
    super();
    this.gameState = "";
    this.rankingState = "";
    this.availableCommandsCount = 0;
  }
}
function change(changeStoreItem, nextValue) {
  const prevValue = this[changeStoreItem];
  this[changeStoreItem] = nextValue;
  this.emit(changeStoreItem, prevValue, nextValue);
}
const appStore = new AppStore();

subjects.gameState.subscribe(gameState => {
  change.call(appStore, "gameState", gameState);
});
subjects.rankingState.subscribe(rankingState => {
  change.call(appStore, "rankingState", rankingState);
});
subjects.availableCommandsCount.subscribe(availableCommandsCount => {
  change.call(appStore, "availableCommandsCount", availableCommandsCount);
});

export default appStore;