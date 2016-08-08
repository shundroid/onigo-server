export default class Orb {
  constructor(orb) {
    this.swOrb = orb;
    this.battery = null;
  }
  getStates() {
    return {
      name: this.swOrb.name,
      linkedClients: this.swOrb.linkedClients,
      port: this.swOrb.port,
      battery: this.battery
    };
  }
}