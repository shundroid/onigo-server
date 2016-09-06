import eventPublisher from "./publisher";

const socketsUseEvents = [
  "gameState",
  "rankingState",
  "availableCommandsCount",
  "controllers",
  "unnamedClients",
  "link",
  "addOrb",
  "disconnect",
  "reconnect",
  "oni",
  "checkBattery",
  "resetHp",
  "pingAll",
  "color",
  "orbs",
  "defaultControllers",
  "defaultUnnameds",
  "addUnnamed",
  "named",
  "removeUnnamed",
  "removeClient",
  "updateOrbs",
  "hp",
  "log",
  "streamed",
  "successReconnect",
  "notifications"
];
let instance = null;
function SocketManager() {
  if (instance !== null) {
    return instance;
  }
  this.isLastSentBySocket = {};
  this.socket = io();
  this.socket.on("defaultData", (state, count, controllers, orbs, unnameds) => {
    emit.call(this, "orbs", orbs);
    emit.call(this, "defaultControllers", controllers);
    emit.call(this, "defaultUnnameds", unnameds);
  });
  socketsUseEvents.forEach(eventName => {
    this.isLastSentBySocket[eventName] = false;
    eventPublisher.on(eventName, function(...datas) {
     if (this.isLastSentBySocket[eventName]) {
        this.isLastSentBySocket[eventName] = false;
      } else {
        this.socket.emit.apply(this.socket, [eventName].concat(datas));
      }
    }.bind(this));
    this.socket.on(eventName, function(...datas) {
      console.log(`socket.on eventName: ${eventName}`);
      emit.apply(this, [eventName].concat(datas));
    }.bind(this));
  });
  instance = this;
}

// eventPublisher.emit をする。
// その時、自分が on している listener は呼び出さないよう、
// listenerをいったん削除して、emitしたあと追加している。
// listenerの名前は、send<eventName（一文字目大文字）>とする。
function emit(eventName, ...datas) {
  this.isLastSentBySocket[eventName] = true;
  eventPublisher.emit.apply(eventPublisher, [eventName].concat(datas));
}

export default SocketManager;

