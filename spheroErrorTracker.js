import subjects from "./subjects";

export default class SpheroErrorTracker {
  constructor(connector) {
    this.errorCount = 0;
    this.connector = connector;
    this.consoleError = console.error;
    console.error = (message) => {
      const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code (121|1167)/.exec(message);
      if (exec121Error !== null) {
        const port = exec121Error[2];
        if (this.connector.isConnecting(port)) {
          this.errorCount++;
          if (this.errorCount < 5) {
            log(`Catched 121 error. Reconnecting... (${this.errorCount})`, "warning");
            this.connector.reconnect(port);
          } else {
            this.errorCount = 0;
            log("Catched 121 error. But this is 5th try. Give up.", "warning");
            this.connector.giveUp(port);
          }
        } else {
          log("Catched 121 error. But port is invalid.", "error");
        }
      } else {
        log("Catched unknown error: \n" + message.toString(), "error");
      }
      this.consoleError(message);
    };
  }
}
function log(message, type) {
  subjects.currentLog.publish({ text: message, type });
}
