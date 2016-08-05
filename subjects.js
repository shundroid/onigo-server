import { BehaviorSubject, Subject } from "rx";

export default {
  gameState: new BehaviorSubject("inactive"),
  rankingState: new BehaviorSubject("hide"),
  availableCommandsCount: new BehaviorSubject(1),
  orbs: new BehaviourSubject({}),
  currentLog: new BehaviourSubject(""),
  controllers: new BehaviourSubject({}),
  unnamedClients: new BehaviourSubject([]),
  // ここにデータのない通知（ping、batteryなど）が流れてくる
  notifications: new Subject()
};