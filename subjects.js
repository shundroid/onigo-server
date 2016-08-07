import { BehaviorObservable, Observable } from "./util/observable";

export default {
  gameState: new BehaviorObservable("inactive"),
  rankingState: new BehaviorObservable("hide"),
  availableCommandsCount: new BehaviorObservable(1),
  orbs: new BehaviorObservable({}),
  currentLog: new BehaviorObservable(""),
  controllers: new BehaviorObservable([]),
  unnamedClients: new BehaviorObservable([]),
  // ここにデータのない通知（ping、batteryなど）が流れてくる
  notifications: new Observable(),
  spheroServerEvents: new Observable()
};