import eventPublisher from "./publisher";

// server -> client
const useEvents = [
  "controllers",
  "unnamedClients",
  "orbs",
];
// server <- client
const useNotifications = [
  "addOrb",
  "checkBattery",
  "updateLink"
];
// server <> client
const useBothStates = [
  "gameState",
  "rankingState",
  "availableCommandsCount"
];
let instance = null;
function SocketManager() {
  if (instance !== null) {
    return instance;
  }
  this.socket = io();
  this.isSentBySocket = {};

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
  useBothStates.forEach(stateName => {
    this.socket.on(stateName, state => {
      this.isSentBySocket[stateName] = true;
      eventPublisher.emit(stateName, state);
    });
    eventPublisher.on(stateName, state => {
      if (this.isSentBySocket[stateName]) {
        delete this.isSentBySocket[stateName];
      } else {
        this.socket.emit(stateName, state);
      }
    });
  });
  instance = this;
}

export default SocketManager;
