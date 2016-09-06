export default class MiddlewareBase {
  constructor() {
    this.observers = {};
  }
  defineObserver(observableName, observer) {
    this.observers[observableName] = observer;
  }
  getObserver(observableName) {
    return this.observers[observableName];
  }
}