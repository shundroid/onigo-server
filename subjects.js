import { BehaviorObservable, Observable } from "./util/observable";

export default {
  gameState: new Observable(),
  rankingState: new Observable(),
  availableCommandsCount: new Observable(),
  orbs: new Observable(),
  currentLog: new Observable(),
  controllers: new Observable(),
  unnamedClients: new Observable(),
  // ここにデータのない通知（ping、batteryなど）が流れてくる
  notifications: new Observable(),
  spheroServerEvents: new Observable()
};