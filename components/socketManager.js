import socketIO from "socket.io";
import subjects from "../subjects/appSubjects";
import actionCreator from "../actions/actionCreator";
import socketTransformers from "../socketTransformers";
import controllerStore from "../stores/controllerStore";
import orbStore from "../stores/orbStore";
import appStore from "../stores/appStore";

const stores = {
  controller: controllerStore,
  orb: orbStore,
  app: appStore
};

const socketsUseStoreItems = {
  orb: [
    "orbs"
  ],
  controller: [
    "unnamedClients",
    "controllers"
  ],
  app: [
    "gameState"
  ]
};

export default class SocketManager {
  constructor(server) {
    // { subjectName: socketId , ... }
    this.lastSentSockets = {};
    Object.keys(socketsUseStoreItems).forEach(storeName => {
      this.lastSentSockets[storeName] = {};
      socketsUseStoreItems[storeName].forEach(subjectName => {
        this.lastSentSockets[storeName][subjectName] = null;
      });
    });
    
    this.io = socketIO(server);
    this.io.on("connection", socket => {
      Object.keys(socketsUseStoreItems).forEach(storeName => {
        socketsUseStoreItems[storeName].forEach(subjectName => {
          stores[storeName][subjectName].subscribe(item => {
            // io.sockets.emit でもやれそうだが、
            // BehaviorSubject で、現在の値をとれるようにするため、
            // socketごとにsubscribeしている。
            if (this.lastSentSockets[subjectName] === socket.id) {
              this.lastSentSockets[subjectName] = null;
            } else {
              let sendItem;
              if (typeof socketTransformers[subjectName] !== "undefined") {
                sendItem = socketTransformers[subjectName](item);
              } else {
                sendItem = item;
              }
              socket.emit(subjectName, sendItem);
            }
          });
          socket.on(subjectName, item => {
            this.lastSentSockets[subjectName] = socket.id;
            subjects[subjectName].publish(item);
          });
        });
      });
      socket.on("notifications", notification => {
        actionCreator.raiseEvent("notifications", notification);
      });
    });
  }
}