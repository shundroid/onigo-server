import { BehaviorObservable } from "./observable";

export default class StoreItem extends BehaviorObservable {
  constructor(defaultValue = null) {
    super(defaultValue);
  }
  get() {
    return this.currentValue;
  }
}