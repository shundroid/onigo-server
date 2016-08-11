import { EventEmitter } from "events";

export default class SpheroErrorTracker extends EventEmitter {
  constructor(maxRetry) {
    super();
    this.errorCount = 0;
    this.maxRetry = 0;
    this.consoleError = console.error;
    console.error = (message) => {
      const exec121Error = /Error: Opening (\\\\\.\\)?(.+): Unknown error code (121|1167)/.exec(message);
      if (exec121Error !== null) {
        const port = exec121Error[2];
        if (this.errorCount + 1 < this.maxRetry) {
          this.emit("error", port, this.errorCount++);
        } else {
          this.errorCount = 0;
          this.emit("giveUp", port);
        }
      }
      this.consoleError(message);
    };
  }
}
