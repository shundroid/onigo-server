import eventPublisher from "./publisher";

const useEvents = [
  "gameState",
  "rankingState",
  "availableCommandsCount",
  "controllers",
  "unnamedClients",
  "orbs",
];
const useNotifications = [
  "addOrb",
  "checkBattery",
  "updateLink"
];
let instance = null;
function SocketManager() {
  if (instance !== null) {
    return instance;
  }
  this.socket = io();

  useEvents.forEach(eventName => {
    this.socket.on(eventName, function(...datas) {
      eventPublisher.emit.apply(eventPublisher, [eventName].concat(datas));
    }.bind(this));
  });
  eventPublisher.on("notifications", notification => {
    if (useNotifications.indexOf(notification.type) !== -1) {
      this.socket.emit("notifications", notification);
    }
  });
  instance = this;
}

export default SocketManager;
