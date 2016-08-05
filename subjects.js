import { BehaviorSubject } from "rx";

export default {
  gameState: new BehaviorSubject("inactive"),
  rankingState: new BehaviorSubject("hide"),
  availableCommandsCount: new BehaviorSubject(1)
};