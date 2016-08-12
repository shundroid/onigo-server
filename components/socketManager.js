import socketIO from "socket.io";
import subjects from "../subjects";
import socketTransformers from "../socketTransformers";
import controllerStore from "../stores/controllerStore";
import orbStore from "../stores/orbStore";

const stores = {
  controller: controllerStore,
  orb: orbStore
};

const socketsUseSubjects = {
  orb: [
    "orbs"
  ],
  controller: [
    "unnamedClients",
    "controllers"
  ]
};

export default class SocketManager {
  constructor(server) {
    // { subjectName: socketId , ... }
    this.lastSentSockets = {};
    Object.keys(socketsUseSubjects).forEach(storeName => {
      this.lastSentSockets[storeName] = {};
      socketsUseSubjects[storeName].forEach(subjectName => {
        this.lastSentSockets[storeName][subjectName] = null;
      });
    });
    
    this.io = socketIO(server);
    this.io.on("connection", socket => {
      Object.keys(socketsUseSubjects).forEach(storeName => {
        socketsUseSubjects[storeName].forEach(subjectName => {
          stores[storeName].on(subjectName, (prevItem, item) => {
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
        subjects.notifications.publish(notification);
      });
    });
  }
}