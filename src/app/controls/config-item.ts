import { EventEmitter } from '@angular/core';

export class ConfigItem<T> {
  private val: T;
  readonly change = new EventEmitter<T>();

  get value(): T {
    return this.val;
  }

  set value(val: T) {
    this.val = val;
    this.change.emit(val);
  }

  constructor(initialValue: T) {
    this.val = initialValue;
  }
}
