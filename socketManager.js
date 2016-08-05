import socketIO from "socket.io";
import subjects from "./subjects";
import { Observable } from "rx";

const socketsUseSubjects = [
  "gameState",
  "rankingState",
  "availableCommandsCount"
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
      Observable.from(Object.keys(subjects)).filter(subjectName => {
        return socketsUseSubjects.indexOf(subjectName) !== -1;
      }).subscribe(subjectName => {
        subjects[subjectName].subscribe(item => {
          // io.sockets.emit でもやれそうだが、
          // BehaviorSubject で、現在の値をとれるようにするため、
          // socketごとにsubscribeしている。
          if (this.lastSentSockets[subjectName] === socket.id) {
            this.lastSentSockets[subjectName] = null;
          } else {
            socket.emit(subjectName, item);
          }
        });
        Observable.fromEvent(socket, subjectName).subscribe(item => {
          this.lastSentSockets[subjectName] = socket.id;
          subjects[subjectName].onNext(item);
        });
      });
    });
  }
}