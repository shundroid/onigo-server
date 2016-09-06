import appStore from "../stores/appStore";
import subjects from "../subjects/appSubjects";
import MiddlewareBase from "./middlewareBase";

export default class OrbManager extends MiddlewareBase {
  constructor(spheroServer) {
    super();
    this.spheroServer = spheroServer;
    subjects.notifications.subscribe(notification => {
      if (notification.type === "checkBattery") {
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
    this.defineObserver("addOrb", (orb, onNext) => {
      const swOrb = orb.swOrb;
      this.spheroServer.addOrb(swOrb);
      if (!appStore.isTestMode.get()) {
        swOrb.instance.streamOdometer();
        swOrb.instance.on("odometer", data => {
          // これらは更新されたときに orbModel を変えて、subject は orbs で dashboard に送りたい
          // const time = new Date();
          // dashboard.streamed(
          //   name,
          //   ("0" + time.getHours()).slice(-2) + ":" +
          //   ("0" + time.getMinutes()).slice(-2) + ":" +
          //   ("0" + time.getSeconds()).slice(-2));
        });
      }
      swOrb.on("link", () => {
        orb.setLink(true);
      });
      swOrb.on("unlink", () => {
        orb.setLink(false);
      });
      onNext(orb);
    });
    // subjects.orbs.subscribe(orbs => {
    //   diff.removed.forEach(orb => {
    //     this.orbs.delete(orb.swOrb.orbName);
    //     // Todo: this.spheroServer.removeOrbする
    //   });
    // });
  }
}