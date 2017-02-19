import "../css/style.css";

import Vue from "vue";
import appOptions from "./components/app.vue";
import eventPublisher from "./publisher";
import ControllerManager from "./controllerManager";
import SocketManager from "./socketManager";
import AddOrb from "./addOrb";
import OrbManager from "./orbManager";
import CheckBatteryButton from "./checkBatteryButton";
import PingButton from "./pingButton";
import UnnamedControllers from "./unnamedControllers";
import Log from "./log";

document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue(appOptions).$mount("#app");
  new ControllerManager(document.getElementById("controllers"));
  new AddOrb();
  new OrbManager(document.getElementById("orbs"));
  new SocketManager();
  new CheckBatteryButton(document.getElementById("check-battery-button"));
  new PingButton(document.getElementById("ping-button"));
  new UnnamedControllers(document.getElementById("unnamed-controllers"));
  new Log();
});

