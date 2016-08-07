import spheroWebSocket from "sphero-websocket";
import subjects from "./subjects";
import arrayDiff from "./util/arrayDiff";

export default class SpheroServerObserver {
  constructor(config, isTestMode, controllerModel) {
    this.controllerModel = controllerModel;
    this.spheroServer = spheroWebSocket(config, isTestMode).spheroServer;
    this.spheroServer.events.on("addClient", (key, client) => {
      this.controllerModel.add(key, client);
    });
    this.unnamedClients = [];
    subjects.unnamedClients.subscribe(unnamedClients => {
      const addedUnnamedClients = arrayDiff.getDiff(this.unnamedClients, unnamedClients).added;
      addedUnnamedClients.forEach(client => {
        client.on("arriveCustomMessage", (name, data, mesID) => {
          // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
          // requestNameとuseDefinedNameを分けている。
          // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
          // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
          if (name === "requestName") {
            if (this.controllerModel.has(data)) {
              client.sendCustomMessage("rejectName", null);
            } else {
              this.controllerModel.setName(client.key, data);
              client.sendCustomMessage("acceptName", data);
            }
          } else if (name === "useDefinedName") {
            if (!this.controllerModel.has(data)) {
              client.sendCustomMessage("rejectName", null);
            } else {
              this.controllerModel.setName(client.key, data);
              client.sendCustomMessage("acceptName", data);
            }
          }
        });
      });
      this.unnamedClients = unnamedClients;
    });
  }
}