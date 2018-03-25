import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

import { KeypressEventType } from '../../keypress/keypress.service';
import { ControlsService } from '../../controls/controls.service';
import { MidiCommand } from './midi-command';
import { KeypressEventWithChannel } from '../keypress-with-channel';

export function noteFixedVelocity(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  const flatStream = keyStreams.mergeAll();
  const downs = flatStream.filter(event => event.eventType === KeypressEventType.Down).map(event => {
    return MidiCommand.noteOn(event.channel, event.keyNumber, controls.velocity.fixedValue);
  });
  const ups = flatStream.filter(event => event.eventType === KeypressEventType.Up).map(event => {
    return MidiCommand.noteOff(event.channel, event.keyNumber, controls.velocity.fixedValue);
  });
  return Observable.merge(downs, ups);
}
