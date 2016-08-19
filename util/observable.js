export class Observable {
  constructor() {
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }
  publish(nextValue) {
    return new Promise((resolve, reject) => {
      Promise.all(this.observers.map(observer => () => new Promise((resolve, reject) => {
        observer(nextValue, () => {
          resolve();
        }, (error) => {
          reject(error);
        });
      }))).then(() => {
        resolve();
      }, error => {
        reject(error);
      });
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