import SocketIOClient from "socket.io-client";
import { EventEmitter } from "events";

const emitEvents = [
  "updateOrbs",
  "rejectName"
];

export default class PortManager extends EventEmitter {
  constructor() {
    this.socket = null;
  }
  isConnected() {
    return this.socket !== null;
  }
  connect(port) {
    if (this.isConnected()) {
      this.disconnect();
    }
    this.socket = SocketIOClient(`http://localhost:${port}`);
    this.socket.once("connect", () => {
      emitEvents.forEach(eventName => {
        this.socket.on(eventName, (...data) => {
          this.emit(eventName, ...data);
        });
      });
    });
  }
  disconnect() {
    this.socket = null;
  }
  addOrb(name, port) {
    if (!this.isConnected()) {
      throw new Error("The socket is not connected.");
    }
    this.socket.emit("addOrb", name, port);
  }
  removeOrb(name) {
    if (!this.isConnected()) {
      throw new Error("The socket is not connected.");
    }
    this.socket.emit("removeOrb", name);
  }
  runCommand(targetName, commandName, ...args) {
    if (!this.isConnected()) {
      throw new Error("The socket is not connected.");
    }
    this.socket.emit("runCommand", targetName, commandName, ...args);
  }
  getSpheros() {
    this.socket.emit("getSpheros");
  }
}
