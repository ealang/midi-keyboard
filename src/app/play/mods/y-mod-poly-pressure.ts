import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

import { KeypressEventType } from '../../keypress/keypress.service';
import { ControlsService } from '../../controls/controls.service';
import { KeypressEventWithChannel } from '../keypress-with-channel';
import { MidiCommand } from './midi-command';
import { normToMidi } from './math';

export function yModPolyphonicPressure(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  return keyStreams.map(stream => {
    return stream.filter(event => {
      return event.eventType !== KeypressEventType.Up && !!event.coordinates;
    }).map(event => {
      const pressure = normToMidi(event.coordinates.y, controls.yMod.yInvert);
      return MidiCommand.polyphonicKeyPressure(event.channel, event.keyNumber, pressure);
    });
  }).mergeAll();
}

