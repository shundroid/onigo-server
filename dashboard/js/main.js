import "../css/style.css";

// import eventPublisher from "./publisher";
// import ControllerManager from "./controllerManager";
// import RankingState from "./rankingState";
// import GameState from "./gameState";
// import AvailableCommandsCount from "./availableCommandsCount";
// import AddOrb from "./addOrb";
// import OrbManager from "./orbManager";
// import CheckBatteryButton from "./checkBatteryButton";
// import PingButton from "./pingButton";
// import Log from "./log";

import ko from "knockout";
import AppModel from "./model/appModel";
import OrbModel from "./model/orbModel";
import ControllersViewModel from "./viewModel/controllers";
import UnnamedClientsViewModel from "./viewModel/unnamedClients";
import OrbsViewModel from "./viewModel/orbs";
import SocketManager from "./socketManager";

document.addEventListener("DOMContentLoaded", () => {
  // new ControllerManager(document.getElementById("controllers"));
  // new RankingState(document.getElementById("show-ranking-button"));
  // new GameState(document.getElementById("game-state-button"));
  // new AddOrb();
  // new OrbManager(document.getElementById("orbs"));
  // new AvailableCommandsCount(
  //     document.getElementById("available-commands"),
  //     document.getElementById("set-available-commands-button"));
  new SocketManager();
  // new CheckBatteryButton(document.getElementById("check-battery-button"));
  // new PingButton(document.getElementById("ping-button"));
  // new Log();

  new SocketManager();
  const appModel = new AppModel();
  const orbModel = new OrbModel();
  const controllersViewModel = new ControllersViewModel(appModel, orbModel);
  const orbsViewModel = new OrbsViewModel(orbModel);
  const unnamedClientsViewModel = new UnnamedClientsViewModel(appModel);
  ko.applyBindings({
    controllersViewModel,
    orbsViewModel,
    unnamedClientsViewModel
  });
});

