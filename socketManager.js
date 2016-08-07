import socketIO from "socket.io";
import subjects from "./subjects";
import socketTransformers from "./socketTransformers";

const socketsUseSubjects = [
  "gameState",
  "rankingState",
  "availableCommandsCount",
  "unnamedClients",
  "controllers"
];

export default class SocketManager {
  constructor(server) {
    // { subjectName: socketId , ... }
    this.lastSentSockets = {};
    Observable.from(socketsUseSubjects).subscribe(subjectName => {
      this.lastSentSockets[subjectName] = null;
    });
    
    this.io = socketIO(server);
    this.io.on("connection", socket => {
      Object.keys(subjects).filter(subjectName => {
        return socketsUseSubjects.indexOf(subjectName) !== -1;
      }).forEach(subjectName => {
        subjects[subjectName].subscribe(item => {
          console.log("fugafugafuga " + subjectName);
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
  }
}