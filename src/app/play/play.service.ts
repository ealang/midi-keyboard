import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';

import { WebMidiService } from '../webmidi.service';
import { ControlsService } from '../controls/controls.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';

import { noteFixedVelocity } from './mods/note-fixed-velocity';
import { noteYModVelocity } from './mods/note-y-mod-velocity';
import { xSlideModPitch } from './mods/x-slide-mod-pitch';
import { yModPolyphonicPressure } from './mods/y-mod-poly-pressure';
import { KeypressEventWithChannel } from './keypress-with-channel';

function groupKeypresses(keypresses: Observable<KeypressEvent>): Observable<Observable<KeypressEvent>> {
  return keypresses.groupBy(
    keypress => keypress.keyNumber,
    keypress => keypress,
    keyStream => {
      return keyStream.filter(keypress => {
        return keypress.eventType === KeypressEventType.Up;
      });
    }
  );
}

function attachChannelFactory(controls: ControlsService): () => (event: KeypressEvent) => KeypressEventWithChannel {
  let rrChannel = 0;
  const onNewStream = () => {
    const myChannel = controls.channelMode.value === 'fixed' ?
      controls.channelFixedChannel.value :
      (() => {
        const c = rrChannel;
        rrChannel = (rrChannel + 1) % 16;
        return c;
      })();
    return (event: KeypressEvent) => {
      return <KeypressEventWithChannel>{...event, channel: myChannel};
    };
  };
  return onNewStream;
}

function constructPipeline(
  keyStreams: Observable<Observable<KeypressEventWithChannel>>,
  controls: ControlsService
): Observable<Array<Array<number>>> {
  const empty = Observable.empty<Array<Array<number>>>();

  const velocity = controls.velocityMode.value === 'fixed' ?
    noteFixedVelocity(keyStreams, controls) :
    noteYModVelocity(keyStreams, controls);

  const yMod = controls.yModMode.value === 'pressure' ?
    yModPolyphonicPressure(keyStreams, controls) :
    empty;

  const xSlideMod = controls.xSlideMode.value === 'channel-pitch-bend' ?
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
    const keyStreams = groupKeypresses(this.keypresses)
      .map((stream: Observable<KeypressEvent>) => {
        return stream.map(attachChannel()).share();
      }).share();

    const configChangedStream = Observable.merge(
      controls.channelMode.change,
      controls.velocityMode.change,
      controls.yModMode.change,
      controls.xSlideMode.change,
      controls.xSlidePitchBendSemi.change,
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
