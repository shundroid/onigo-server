import ko from "knockout";

export default class UnnamedClients {
  constructor(appModel) {
    this.appModel = appModel;

    this.unnamedClients = ko.observableArray([]);
    this.appModel.unnamedClients.subscribe(unnamedClients => {
      this.unnamedClients(unnamedClients);
    });
  }
}
