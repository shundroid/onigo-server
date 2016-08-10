import express from "express";
import io from "socket.io";
import controllerModel from "./controllerModel";
import eventPublisher from "./publisher";

let scoreboardInstance = null;

function Scoreboard(port) {
  if (scoreboardInstance !== null) {
    return scoreboardInstance;
  }
  scoreboardInstance = this;

  this.app = express();
  this.server = require("http").Server(this.app);
  this.io = require("socket.io")(this.server);
  this.io.origins(`localhost:${port}`);

  this.app.use(express.static("scoreboard"));
  this.server.listen(port, () => {
    console.log(`score is listening on port ${port}`);
  });

  this.currentRanking = null;

  this.sockets = [];
  this.io.on("connection", socket => {
    console.log("a scoreboard connected.");
    this.sockets.push(socket);
    if (this.currentRanking !== null) {
      socket.emit("data", this.currentRanking);
    }
  });

  eventPublisher.on("ranking", ranking => {
    this.currentRanking = ranking;
    this.sockets.forEach(socket => {
      socket.emit("data", this.currentRanking);
    });
  });
}

module.exports = Scoreboard;
