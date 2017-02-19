import assert from "assert";
import { AppModel } from "../appModel";
import eventPublisher from "../publisher";

describe("AppModel", () => {
  let appModel;
  beforeEach(() => {
    eventPublisher.removeAllListeners();
    appModel = new AppModel();
  });
  describe("#constructor", () => {
    it("should initialize gameState", () => {
      assert.equal(appModel.gameState, "");
    });
    it("should update gameState when gameState is published", () => {
      const testGameState = "gameState-test";
      eventPublisher.emit("gameState", testGameState);
      assert.equal(appModel.gameState, testGameState);
    });
    it("should initialize rankingState", () => {
      assert.equal(appModel.rankingState, "hide");
    });
    it("should update rankingState when rankingState is published", () => {
      const testRankingState = "rankingState-test";
      eventPublisher.emit("rankingState", testRankingState);
      assert.equal(appModel.rankingState, testRankingState);
    });
    it("should initialize availableCommandsCount", () => {
      assert.equal(appModel.availableCommandsCount, 1);
    });
    it("should update availableCommandsCount when availableCommandsCount is published", () => {
      const testAvailableCommandsCount = "count-test";
      eventPublisher.emit("availableCommandsCount", testAvailableCommandsCount);
      assert.equal(appModel.availableCommandsCount, testAvailableCommandsCount);
    });
  });
  describe("#toggleGameState", () => {
    it("should toggle gameState", () => {
      const activeState = "active";
      const inactiveState = "inactive";
      const invalidState = "invalid-test";

      appModel.gameState = activeState;
      appModel.toggleGameState();
      assert.equal(appModel.gameState, inactiveState);

      appModel.gameState = inactiveState;
      appModel.toggleGameState();
      assert.equal(appModel.gameState, activeState);

      appModel.gameState = invalidState;
      assert.throws(appModel.toggleGameState, Error);
    });
  });
  describe("#toggleRankingState", () => {
    it("should toggle rankingState", () => {
      const hideState = "hide";
      const showState = "show";
      const invalidState = "invalid-test";

      appModel.rankingState = hideState;
      appModel.toggleRankingState();
      assert.equal(appModel.rankingState, showState);

      appModel.rankingState = showState;
      appModel.toggleRankingState();
      assert.equal(appModel.rankingState, hideState);

      appModel.rankingState = invalidState;
      assert.throws(appModel.toggleRankingState, Error);
    });
  });
  describe("#updateAvailableCommandsCount", () => {
    it("should update availableCommandsCount", () => {
      const count = "test-count";
      appModel.updateAvailableCommandsCount(count);
      assert.equal(appModel.availableCommandsCount, count);
    });
  });
});