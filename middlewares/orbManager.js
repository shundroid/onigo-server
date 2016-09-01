import subjects from "./subjects/appSubjects";
import Connector from "./connector";
import arrayDiff from "./util/arrayDiff";
import Orb from "./orb";

export default class orbManager {
  constructor(spheroServer, isTestMode, connector) {
    this.spheroServer = spheroServer;
    this.isTestMode = isTestMode;
    this.connector = connector;
    this.orbs = new Map();

    subjects.notifications.subscribe(notification => {
      if (notification.type === "addOrb") {
        this.addOrb(notification.orbName, notification.orbPort);
      } else if (notification.type === "checkBattery") {
        for (let orb of this.orbs.values()) {
          orb.checkBattery().then(() => {
            // 内部で orb.battery が更新された
            subjects.orbs.publish([...this.orbs.values()]);
          }, error => {
            throw new Error(error);
          });
        }
      }
    });
    subjects.addOrb.subscribe(orbDetails => {
      const orb = orbDetails.orbInstance;
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
      orb.on("link", () => {
        orb.setLink(true);
      });
      orb.on("unlink", () => {
        orb.setLink(false);
      });
    });
    subjects.orbs.subscribe(orbs => {
      const diff = arrayDiff.getDiff([...this.orbs.values()], orbs);
      diff.added.forEach(orb => {
        this.orbs.set(orb.swOrb.orbName, orb);
        this.spheroServer.addOrb(orb.swOrb);
        orb.swOrb.instance.streamOdometer();
        orb.swOrb.instance.on("odometer", data => {
          // これらは更新されたときに orbModel を変えて、subject は orbs で dashboard に送りたい
          // const time = new Date();
          // dashboard.streamed(
          //   name,
          //   ("0" + time.getHours()).slice(-2) + ":" +
          //   ("0" + time.getMinutes()).slice(-2) + ":" +
          //   ("0" + time.getSeconds()).slice(-2));
        });
        orb.swOrb.on("link", () => {
          orb.setLink(true);
          subjects.orbs.publish([...this.orbs.values()]);
        });
        orb.swOrb.on("unlink", () => {
          orb.setLink(false);
          subjects.orbs.publish([...this.orbs.values()]);
        });
      });
      diff.removed.forEach(orb => {
        this.orbs.delete(orb.swOrb.orbName);
        // Todo: this.spheroServer.removeOrbする
      });
    });
  }
  addOrb(name, port) {
    const newOrb = this.spheroServer.makeRawOrb(name, port);
    if (!this.isTestMode) {
      if (!this.connector.isConnecting(port)) {
        this.connector.connect(port, newOrb.instance).then(() => {
          subjects.currentLog.publish({ text: "connected orb.", type: "success" });
          newOrb.instance.configureCollisions({
            meth: 0x01,
            xt: 0x7A,
            xs: 0xFF,
            yt: 0x7A,
            ys: 0xFF,
            dead: 100
          }, () => {
            subjects.currentLog.publish({ text: "configured orb.", type: "success" });
            const nextOrbs = new Map(this.orbs);
            nextOrbs.set(name, new Orb(newOrb));
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