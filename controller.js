import { EventEmitter } from "events";

const defaultHp = 100;
const defaultColor = "green";

export default class Controller extends EventEmitter {
  constructor(name, commandRunner) {
    super();

    this.client = null;
    this.commandRunner = commandRunner;
    this.name = name;
    this.setHp(defaultHp);
    this.setIsOni(false);
    this.setLink(null);
    this.setColor(defaultColor);
  }
  setHp(hp) {
    this.hp = hp;
    if (this.client !== null) {
      this.client.sendCustomMessage("hp", this.hp);
    }
    this.emit("hp", this.hp);
  }
  setIsOni(isOni) {
    this.isOni = isOni;
    if (this.client !== null) {
      this.client.sendCustomMessage("oni", this.isOni);
    }
    this.emit("oni", this.isOni);
  }
  setLink(orbName) {
    // client も持っているが、それに左右されずにするため link は別に持つ必要がある
    this.linkedOrbName = orbName;
    //updateColor.call(this);
  }
  setClient(client) {
    this.client = client;
    if (this.client !== null) {
      this.client.sendCustomMessage("hp", this.hp);
      this.client.sendCustomMessage("oni", this.isOni);
      this.client.sendCustomMessage("color", this.color);
    }
    if (this.linkedOrb !== null && this.client !== null) {
      // HPなどの Orb -> Client への伝達で、
      // client にも linkedOrb を入れておく必要がある。
      this.client.setLinkedOrb(this.linkedOrb);
    }
  }
  setColor(color) {
    this.color = color;
    updateColor.call(this);
    if (this.client !== null) {
      this.client.sendCustomMessage("color", this.color);
    }
  }
  getStates() {
    return {
      hp: this.hp,
      isOni: this.isOni,
      link: this.linkedOrb !== null ? this.linkedOrb.name : null,
      key: this.client !== null ? this.client.key : null,
      color: this.color
    };
  }
}

function updateColor() {
  if (this.linkedOrb !== null) {
    this.linkedOrb.command("color", [this.color]);
  }
}
