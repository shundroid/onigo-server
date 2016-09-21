import { Observable } from "./observable";
export default class Subject extends Observable {
  constructor(defaultValue = null) {
    super();
    this.currentValue = defaultValue;
    this.stores = [];
  }
  defineSequence(subjectName, ...middlewares) {
    middlewares.forEach(middleware => {
      this.subscribe(middleware.getObserver(subjectName));
    });
  }
  subscribeStore(store) {
    this.stores.push(store);
  }
  flowCurrentValue() {
    if (this.currentValue !== null) {
      this.publish(this.currentValue);
    }
  }
  publish(nextValue) {
    const callObservers = (resolve, reject) => {
      let index = 0;
      const error = err => {
        reject(err);
      };
      const next = newNextValue => {
        if (index >= this.observers.length) {
          resolve(newNextValue);
        } else {
          this.observers[index++](newNextValue, next, error);
        }
      };
      next(nextValue);
    };
    callObservers(nextValue => {
      this.stores.forEach(store => {
        store(nextValue);
      });
      this.currentValue = nextValue;
    }, err => {
      throw new Error(err);
    });
  }
}
