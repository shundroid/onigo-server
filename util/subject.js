import { BehaviorObservable } from "./observable";
export default class Subject extends BehaviorObservable {
  constructor(defaultValue = null) {
    super(defaultValue);
    this.stores = [];
  }
  subscribeStore(store) {
    this.stores.push(store);
    if (this.currentValue !== null) {
      store(this.currentValue);
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
