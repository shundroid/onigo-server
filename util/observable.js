export class Observable {
  constructor() {
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }
  publish(nextValue) {
    this.observers.forEach(observer => {
      observer(nextValue);
    });
  }
}

export class BehaviorObservable extends Observable {
  constructor(defaultValue = null) {
    super();
    this.currentValue = defaultValue;
  }
  subscribe(observer) {
    super.subscribe(observer);
    if (this.currentValue !== null) {
      observer(this.currentValue);
    }
  }
  publish(nextValue) {
    super.publish(nextValue);
    this.currentValue = nextValue;
  }
}