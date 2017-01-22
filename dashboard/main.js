import "../css/style.css";

import Vue from "vue";
import Vuex from "vuex";

import appOptions from "../components/app.vue";
import eventPublisher from "./publisher";
import ControllerManager from "./controllerManager";
import SocketManager from "./socketManager";
import RankingState from "./rankingState";
import GameState from "./gameState";
import AvailableCommandsCount from "./availableCommandsCount";
import AddOrb from "./addOrb";
import OrbManager from "./orbManager";
import CheckBatteryButton from "./checkBatteryButton";
import PingButton from "./pingButton";
import UnnamedControllers from "./unnamedControllers";
import Log from "./log";

Vue.use(Vuex);
document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue(appOptions).$mount("#app");

  new ControllerManager(document.getElementById("controllers"));
  new RankingState(document.getElementById("show-ranking-button"));
  new GameState(document.getElementById("game-state-button"));
  new AddOrb();
  new OrbManager(document.getElementById("orbs"));
  new AvailableCommandsCount(
      document.getElementById("available-commands"),
      document.getElementById("set-available-commands-button"));
  new SocketManager();
  new CheckBatteryButton(document.getElementById("check-battery-button"));
  new PingButton(document.getElementById("ping-button"));
  new UnnamedControllers(document.getElementById("unnamed-controllers"));
  new Log();
});
