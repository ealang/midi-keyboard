import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

import { KeypressEventType } from '../../keypress/keypress.service';
import { ControlsService } from '../../controls/controls.service';
import { MidiCommand } from './midi-command';
import { KeypressEventWithChannel } from '../keypress-with-channel';
import { applyDeadZone } from './math';

export function xSlideModPitch(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  const channelInits = keyStreams.map(stream => {
    return stream.first();
  }).mergeAll().distinct((event) => event.channel).map(event => {
    return MidiCommand.pitchBendSensitivity(
      event.channel,
      controls.xSlideMod.pitchBendSemi.value
    );
  });

  const bends = keyStreams.map(stream => {
    const resets = stream.filter(event => event.event.eventType === KeypressEventType.Up)
      .map(event => {
        return MidiCommand.pitchBendReset(event.channel);
      });
    const changes = stream
      .filter(event => !!event.event.coordinates)
      .scan((state, event: KeypressEventWithChannel) => {
        const x = event.event.coordinates.x;
        if (event.event.eventType === KeypressEventType.Down) {
          return { xStart: x, x: x, channel: event.channel };
        } else {
          return Object.assign({}, state, {x: x});
        }
      }, {}).map((state: any) => {
        return MidiCommand.pitchBendNorm(
          state.channel,
          applyDeadZone(state.x - state.xStart, controls.xSlideMod.deadZone)
        );
      });
      return Observable.merge(resets, changes);
    }).mergeAll();
  return Observable.merge(bends, channelInits);
}
