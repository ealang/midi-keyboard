import { KeypressEvent } from '../keypress/keypress.service';

export class KeypressEventWithChannel {
  constructor(readonly event: KeypressEvent, readonly channel: number) {}
}
