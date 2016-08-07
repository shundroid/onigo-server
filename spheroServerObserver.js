import spheroWebSocket from "sphero-websocket";
import subjects from "./subjects";
import arrayDiff from "./util/arrayDiff";

export default class SpheroServerObserver {
  constructor(config, isTestMode, controllerModel, connector) {
    this.controllerModel = controllerModel;
    this.connector = connector;
    this.spheroServer = spheroWebSocket(config, isTestMode).spheroServer;
    this.isTestMode = isTestMode;
    this.spheroServer.events.on("addClient", (key, client) => {
      this.addUnnamedClient(key, client);
    });
    this.unnamedClients = [];
    subjects.unnamedClients.subscribe(unnamedClients => {
      const addedUnnamedClients = arrayDiff.getDiff(this.unnamedClients, unnamedClients).added;
      addedUnnamedClients.forEach(client => {
        client.on("arriveCustomMessage", (name, data, mesID) => {
          if (/^(requestName|useDefinedName)$/.test(name)) {
            this.processRequestName(name, client, data);
          }
        });
      });
      this.unnamedClients = unnamedClients;
    });
    subjects.notifications.subscribe(notification => {
      if (notification.type === "addOrb") {
        this.addOrb(notification.orbName, notification.orbPort);
      }
    });
  }
  addUnnamedClient(key, client) {
    this.controllerModel.add(key, client);
  }
  processRequestName(messageType, client, name) {
    // Nameが同じなら、clientKeyが別でもHPなどが引き継がれる、と実装するため、
    // requestNameとuseDefinedNameを分けている。
    // requestName ・・ 新しい名前を使う。もしその名前が既に使われていたらrejectする。
    // useDefinedName ・・既存の名前を使う。もしその名前がなければrejectする。
    if (messageType === "requestName") {
      if (this.controllerModel.has(name)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        this.controllerModel.setName(client.key, name);
        client.sendCustomMessage("acceptName", name);
      }
    } else if (messageType === "useDefinedName") {
      if (!this.controllerModel.has(name)) {
        client.sendCustomMessage("rejectName", null);
      } else {
        this.controllerModel.setName(client.key, name);
        client.sendCustomMessage("acceptName", name);
      }
    }
  }
  addOrb(name, port) {
    const rawOrb = this.spheroServer.makeRawOrb(name, port);
    if (!this.isTestMode) {
      if (!this.connector.isConnecting(port)) {
        this.connector.connect(port, rawOrb.instance).then(() => {
          subjects.log.publish({ text: "connected orb.", type: "success" });
          rawOrb.instance.configureCollisions({
            meth: 0x01,
            xt: 0x7A,
            xs: 0xFF,
            yt: 0x7A,
            ys: 0xFF,
            dead: 100
          }, () => {
            subjects.log.publish({ text: "configured orb.", type: "success" });
            this.spheroServer.addOrb(rawOrb);
            rawOrb.instance.streamOdometer();
            rawOrb.instance.on("odometer", data => {
              // これらは更新されたときに orbModel を変えて、subject は orbs で dashboard に送りたい
              // const time = new Date();
              // dashboard.streamed(
              //   name,
              //   ("0" + time.getHours()).slice(-2) + ":" +
              //   ("0" + time.getMinutes()).slice(-2) + ":" +
              //   ("0" + time.getSeconds()).slice(-2));
            });
          });
        });
      }
    } else {
      this.spheroServer.addOrb(rawOrb);
    }
  }
}