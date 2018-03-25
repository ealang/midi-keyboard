import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Point } from '../geometry';
import { WebMidiService } from '../webmidi.service';
import { ControlsService } from '../controls/controls.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';

import { MidiCommand, MidiCommandSeq } from './midi-command';
import { PlayPluginHost } from './plugins';

@Injectable()
export class PlayService {
  private pluginHost: PlayPluginHost;
  private keypresses = new Subject<KeypressEvent>();

  constructor(
    private readonly midi: WebMidiService,
    private readonly controls: ControlsService
  ) {
    /*
    midi.deviceOpened.subscribe(() => {
      this.processChannelChanged();
    });
    */
    this.pluginHost = new PlayPluginHost(this.keypresses, midi, controls);
  }

  processEvent(event: KeypressEvent): void {
    this.keypresses.next(event);
  }
}
