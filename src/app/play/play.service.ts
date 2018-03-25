import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/takeUntil';

import { WebMidiService } from '../webmidi.service';
import { ControlsService } from '../controls/controls.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';

import { noteFixedVelocity } from './mods/note-fixed-velocity';
import { noteYModVelocity } from './mods/note-y-mod-velocity';
import { xSlideModPitch } from './mods/x-slide-mod-pitch';
import { yModPolyphonicPressure } from './mods/y-mod-poly-pressure';
import { KeypressEventWithChannel } from './keypress-with-channel';

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
    noteFixedVelocity(keyStreams, controls) :
    noteYModVelocity(keyStreams, controls);

  const yMod = controls.yMod.mode.value === 'pressure' ?
    yModPolyphonicPressure(keyStreams, controls).delay(0) :  // TODO: delay is a hack to send pressure commands after node on commands
    empty;

  const xSlideMod = controls.xSlideMod.mode.value === 'channel-pitch-bend' ?
    xSlideModPitch(keyStreams, controls) :
    empty;

  return Observable.merge(
    velocity,
    yMod,
    xSlideMod
  );
}

@Injectable()
export class PlayService {
  private keypresses = new Subject<KeypressEvent>();

  constructor(
    midi: WebMidiService,
    controls: ControlsService
  ) {
    const attachChannel = attachChannelFactory(controls);
    const keyStreams = partitionKeypresses(this.keypresses).map((stream: Observable<KeypressEvent>) => {
        return stream.map(attachChannel()).share();
      }).share();

    const configChangedStream = Observable.merge(
      controls.channel.mode.change,
      controls.velocity.mode.change,
      controls.yMod.mode.change,
      controls.xSlideMod.mode.change,
      controls.xSlideMod.pitchBendSemi.change,
      midi.deviceOpened
    );

    const setupPipeline = () => {
      constructPipeline(keyStreams, controls)
        .takeUntil(configChangedStream)
        .subscribe(cmds => {
          midi.sendData(cmds);
        });
    };

    configChangedStream.subscribe(setupPipeline);
    setupPipeline();
  }

  processEvent(event: KeypressEvent): void {
    this.keypresses.next(event);
  }
}
