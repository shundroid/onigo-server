import { EventEmitter } from "events";

class SocketManager extends EventEmitter {
  constructor() {
    super();
    this.socket = io();
    this.socket.on("defaultData", (state, count, controllers, orbs, unnameds) => {
      this.emit("gameState", state);
      this.emit("availableCommandsCount", count);
      this.emit("orbs", orbs);
      this.emit("defaultControllers", controllers);
      this.emit("defaultUnnameds", unnameds);
    });
    this.socket.on("addUnnamed", key => {
      this.emit("addUnnamed", key);
    });
    this.socket.on("named", (key, name, controllerDetails) => {
      this.emit("named", key, name, controllerDetails);
    });
    this.socket.on("removeUnnamed", key => {
      this.emit("removeUnnamed", key);
    });
    this.socket.on("removeClient", key => {
      this.emit("removeClient", key);
    });
    this.socket.on("updateOrbs", orbs => {
      this.emit("orbs", orbs);
    });
    this.socket.on("hp", (key, hp) => {
      this.emit("hp", key, hp);
    });
    this.socket.on("log", (logText, logType) => {
      this.emit("log", logText, logType);
    });
    this.socket.on("streamed", (orbName, time) => {
      this.emit("streamed", orbName, time);
    });
    this.socket.on("successReconnect", orbName => {
      this.emit("successReconnect", orbName);
    });
  }
  emitToSocket(eventName, ...data) {
    this.socket.emit.apply(this.socket, [eventName].concat(data));
  }
}

export default function(store) {
  var socketManager = new SocketManager();
  socketManager.on("gameState", gameState => {
    store.dispatch("setDefaultGameState", gameState);
  });
  socketManager.on("availableCommandsCount", count => {
    store.dispatch("updateAvailableCommandsCount", count);
  });
  socketManager.on("log", (logText, logType) => {
    store.dispatch("pushLog", { text: logText, type: logType });
  });

  store.subscribe(({ type, payload }, state) => {
    switch (type) {
      case "toggleGameState":
        socketManager.emitToSocket("gameState", state.app.gameState);
        break;
      case "updateAvailableCommandsCount":
        socketManager.emitToSocket("availableCommandsCount", payload);
        break;
    }
  });
}