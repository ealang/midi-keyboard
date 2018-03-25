import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

import { KeypressEvent, KeypressEventType } from '../../keypress/keypress.service';
import { ControlsService } from '../../controls/controls.service';
import { KeypressEventWithChannel } from '../keypress-with-channel';
import { MidiCommand } from './midi-command';
import { normToMidi } from './math';

export function noteYModVelocity(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  function velocityFromEvent(event: KeypressEventWithChannel): number {
    return event.coordinates ?
      normToMidi(event.coordinates.y, controls.velocity.yModInvert) : 0x7F;
  }
  const flatStream = keyStreams.mergeAll();
  const downs = flatStream.filter(event => event.eventType === KeypressEventType.Down).map(event => {
    return MidiCommand.noteOn(event.channel, event.keyNumber, velocityFromEvent(event));
  });
  const ups = flatStream.filter(event => event.eventType === KeypressEventType.Up).map(event => {
    return MidiCommand.noteOff(event.channel, event.keyNumber, velocityFromEvent(event));
  });
  return Observable.merge(downs, ups);
}
