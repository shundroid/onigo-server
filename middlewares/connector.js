import orbStore from "../stores/orbStore";
import appStore from "../stores/appStore";
import Orb from "../orb";
import subjects from "../subjects/appSubjects";
import SpheroErrorTracker from "../spheroErrorTracker";
import MiddlewareBase from "./middlewareBase";

class Connector extends MiddlewareBase {
  constructor(spheroServer) {
    super(); 
    this.spheroErrorTracker = new SpheroErrorTracker(5);
    this.defineObserver("addOrb", (orb, onNext, onError) => {
      const newOrb = spheroServer.makeRawOrb(orb.name, orb.port);
      if (appStore.isTestMode.get()) {
        onNext(new Orb(newOrb));
      } else {
        this.connect(orb.port, newOrb.instance).then(() => {
          newOrb.instance.configureCollisions({
            meth: 0x01,
            xt: 0x7A,
            xs: 0xFF,
            yt: 0x7A,
            ys: 0xFF,
            dead: 100
          }, () => {
            subjects.currentLog.publish({ text: "configured orb.", type: "success" });
            onNext(new Orb(newOrb));
          });
        });
      }
    });
    this.spheroErrorTracker.on("error", (port, errorCount) => {
      if (this.isConnecting(port)) {
        subjects.currentLog.publish(`Catched 121 error. Reconnecting... (${errorCount})`, "warning");
        this.reconnect(port);
      }
    });
    this.spheroErrorTracker.on("giveUp", port => {
      if (this.isConnecting(port)) {
        subjects.currentLog.publish("Catched 121 error. But this is 5th try. Give up.", "warning");
        this.giveUp(port);
      }
    });
    this.rawOrbs = {};
  }
  connect(port, rawOrb) {
    if (this.isConnecting(port)) {
      throw new Error("connectしようとしたorbのportは既に存在しています。port: " + port);
    }
    return new Promise(resolve => {
      this.rawOrbs[port] = { rawOrb, resolve };
      this.rawOrbs[port].rawOrb.connect(() => {
        resolve();
        delete this.rawOrbs[port];
      });
    });
  }
  isConnecting(port) {
    return typeof this.rawOrbs[port] !== "undefined";
  }
  reconnect(port) {
    if (!this.isConnecting(port)) {
      throw new Error("reconnectしようとしましたが、connectしていません。port: " + port);
    }
    this.rawOrbs[port].rawOrb.connect(() => {
      if (this.isConnecting(port)) {
        this.rawOrbs[port].resolve();
        delete this.rawOrbs[port];
      }
    });
  }
  giveUp(port) {
    if (this.isConnecting(port)) {
      delete this.rawOrbs[port];
    }
  }
}

export default Connector;
