import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export class ConfigItem<T> {
  private val: T;
  private subject = new Subject<T>();
  readonly change: Observable<T>;

  get value(): T {
    return this.val;
  }

  set value(val: T) {
    this.val = val;
    this.subject.next(val);
  }

  constructor(initialValue: T) {
    this.val = initialValue;
    this.change = this.subject;
  }
}
