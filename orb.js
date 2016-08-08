export default class Orb {
  constructor(orb) {
    this.swOrb = orb;
    this.battery = null;
    this.isLinked = false;
  }
  getStates() {
    return {
      name: this.swOrb.name,
      linkedClients: this.swOrb.linkedClients,
      port: this.swOrb.port,
      battery: this.battery,
      isLinked: this.isLinked
    };
  }
  checkBattery() {
    return new Promise((resolve, reject) => {
      this.swOrb.instance.getPowerState((error, data) => {
        if (error) {
          reject(error);
        } else {
          this.battery = data.batteryState;
          resolve();
        }
      });
    });
  }
  setLink(isLinked) {
    this.isLinked = isLinked;
  }
}