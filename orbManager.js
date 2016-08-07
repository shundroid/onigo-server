import subjects from "./subjects";
import Connector from "./connector";
import arrayDiff from "./util/arrayDiff";

export default class orbManager {
  constructor(spheroServer, isTestMode) {
    this.spheroServer = spheroServer;
    this.isTestMode = isTestMode;
    this.connector = new Connector();
    this.orbs = new Map();

    subjects.notifications.subscribe(notification => {
      if (notification.type === "addOrb") {
        this.addOrb(notification.orbName, notification.orbPort);
      }
    });
    subjects.orbs.subscribe(orbs => {
      const diff = arrayDiff.getDiff([...this.orbs.values()], orbs);
      diff.added.forEach(orb => {
        this.orbs.set(orb.orbName, orb);
        this.spheroServer.addOrb(orb);
        orb.instance.streamOdometer();
        orb.instance.on("odometer", data => {
          // これらは更新されたときに orbModel を変えて、subject は orbs で dashboard に送りたい
          // const time = new Date();
          // dashboard.streamed(
          //   name,
          //   ("0" + time.getHours()).slice(-2) + ":" +
          //   ("0" + time.getMinutes()).slice(-2) + ":" +
          //   ("0" + time.getSeconds()).slice(-2));
        });
      });
      diff.removed.forEach(orb => {
        this.orbs.delete(orb.orbName);
        // Todo: this.spheroServer.removeOrbする
      });
    });
  }
  addOrb(name, port) {
    const newOrb = this.spheroServer.makeRawOrb(name, port);
    if (!this.isTestMode) {
      if (!this.connector.isConnecting(port)) {
        this.connector.connect(port, newOrb.instance).then(() => {
          subjects.log.publish({ text: "connected orb.", type: "success" });
          newOrb.instance.configureCollisions({
            meth: 0x01,
            xt: 0x7A,
            xs: 0xFF,
            yt: 0x7A,
            ys: 0xFF,
            dead: 100
          }, () => {
            subjects.log.publish({ text: "configured orb.", type: "success" });
            const nextOrbs = new Map(this.orbs);
            nextOrbs.set(name, newOrb);
            subjects.orbs.publish([...nextOrbs.values()]);
          });
        });
      }
    } else {
      const nextOrbs = new Map(this.orbs);
      nextOrbs.set(name, newOrb);
      subjects.orbs.publish([...nextOrbs.values()]);
    }
  }
}