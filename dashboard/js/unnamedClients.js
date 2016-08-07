import ko from "knockout";
import eventPublisher from "./publisher";

export default function UnnamedClients() {
  this.unnamedClients = ko.observableArray([]);
  eventPublisher.on("unnamedClients", unnamedClients => {
    this.unnamedClients.removeAll();
    this.unnamedClients.push.apply(this.unnamedClients, unnamedClients);
  });
}
