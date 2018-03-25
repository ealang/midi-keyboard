import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';
import { WebMidiService } from '../webmidi.service';
import { ControlsService } from '../controls/controls.service';
import { MidiCommand } from './midi-command';

function applyDeadZone(value: number, deadzone: number): number {
  return Math.abs(value) < deadzone ?
    0 :
    value - Math.sign(value) * deadzone;
}

function bound(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

function normToMidi(normValue: number, invert: boolean): number {
  return Math.floor(bound(invert ? 1 - normValue : normValue, 0, 1) * 127);
}

function partitionKeypresses(keypresses: Observable<KeypressEvent>): Observable<Observable<KeypressEvent>> {
  const keyStreams = new Subject<Observable<KeypressEvent>>();
  const keyToStream = new Map<number, Subject<KeypressEvent>>();
  keypresses.subscribe(event => {
    if (event.eventType === KeypressEventType.Down) {
      const subject = new Subject<KeypressEvent>();
      keyToStream.set(event.keyNumber, subject);
      keyStreams.next(subject);
      subject.next(event);
    } else {
      const subject = keyToStream.get(event.keyNumber);
      subject.next(event);
      if (event.eventType === KeypressEventType.Up) {
        subject.complete();
        keyToStream.delete(event.keyNumber);
      }
    }
  });
  return keyStreams;
}

class KeypressEventWithChannel {
  constructor(readonly event: KeypressEvent, readonly channel: number) {}
}

function attachChannelFactory(controls: ControlsService): () => (event: KeypressEvent) => KeypressEventWithChannel {
  let rrChannel = 0;
  const onNewStream = () => {
    const myChannel = controls.channel.mode.value === 'fixed' ?
      controls.channel.fixedChannel.value :
      (() => {
        const c = rrChannel;
        rrChannel = (rrChannel + 1) % 16;
        return c;
      })();
    return (event: KeypressEvent) => {
      return new KeypressEventWithChannel(event, myChannel);
    };
  };
  return onNewStream;
}

function constructPipeline(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
): Observable<Array<Array<number>>> {
  const empty = Observable.empty<Array<Array<number>>>();

  const velocity = controls.velocity.mode.value === 'fixed' ?
    fixedVelocityNotes(keyStreams, controls) :
    yModVelocityNotePlugin(keyStreams, controls);

  const yMod = controls.yMod.mode.value === 'pressure' ?
    yModPolyphonicPressure(keyStreams, controls).delay(0) :  // TODO: delay is a hack to send pressure commands after node on commands
    empty;

  const xSlideMod = controls.xSlideMod.mode.value === 'channel-pitch-bend' ?
    xRelModPitchBend(keyStreams, controls) :
    empty;

  return Observable.merge(
    velocity,
    yMod,
    xSlideMod
  );
}

export class PlayPluginHost {
  constructor(keypresses: Observable<KeypressEvent>, midi: WebMidiService, controls: ControlsService) {
    const attachChannel = attachChannelFactory(controls);
    const keyStreams = partitionKeypresses(keypresses).map((stream: Observable<KeypressEvent>) => {
        return stream.map(attachChannel()).share();
      }).share();

    let curSub = null;
    const setupPipeline = () => {
      if (curSub) {
        curSub.unsubscribe();
      }
      curSub = constructPipeline(keyStreams, controls).subscribe(cmds => {
        midi.sendData(cmds);
      });
    };

    controls.channel.mode.change.subscribe(() => setupPipeline());
    controls.velocity.mode.change.subscribe(() => setupPipeline());
    controls.yMod.mode.change.subscribe(() => setupPipeline());
    controls.xSlideMod.mode.change.subscribe(() => setupPipeline());
    setupPipeline();
  }
}

function fixedVelocityNotes(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  const flatStream = keyStreams.mergeAll();
  const downs = flatStream.filter(event => event.event.eventType === KeypressEventType.Down).map(event => {
    return MidiCommand.noteOn(event.channel, event.event.keyNumber, controls.velocity.fixedValue);
  });
  const ups = flatStream.filter(event => event.event.eventType === KeypressEventType.Up).map(event => {
    return MidiCommand.noteOff(event.channel, event.event.keyNumber, controls.velocity.fixedValue);
  });
  return Observable.merge(downs, ups);
}

function yModVelocityNotePlugin(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  function velocityFromEvent(event: KeypressEvent): number {
    return event.coordinates ?
      normToMidi(event.coordinates.y, controls.velocity.yModInvert) : 0x7F;
  }
  const flatStream = keyStreams.mergeAll();
  const downs = flatStream.filter(event => event.event.eventType === KeypressEventType.Down).map(event => {
    return MidiCommand.noteOn(event.channel, event.event.keyNumber, velocityFromEvent(event.event));
  });
  const ups = flatStream.filter(event => event.event.eventType === KeypressEventType.Up).map(event => {
    return MidiCommand.noteOff(event.channel, event.event.keyNumber, velocityFromEvent(event.event));
  });
  return Observable.merge(downs, ups);
}

function yModPolyphonicPressure(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
) {
  return keyStreams.map(stream => {
    return stream.filter(event => {
      return event.event.eventType !== KeypressEventType.Up && !!event.event.coordinates;
    }).map(event => {
      const pressure = normToMidi(event.event.coordinates.y, controls.yMod.yInvert);
      return MidiCommand.polyphonicKeyPressure(event.channel, event.event.keyNumber, pressure);
    });
  }).mergeAll();
}

function xRelModPitchBend(
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
