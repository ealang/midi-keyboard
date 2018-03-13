import { Injectable } from '@angular/core';

import { Point } from '../geometry';
import { WebMidiService } from '../webmidi.service';
import { ControlsService } from '../controls/controls.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';

import { MidiCommand } from './midi-command';
import { SlideAccum } from './slide-accum';

@Injectable()
export class PlayService {
  private readonly accum = new SlideAccum();

  constructor(
    private readonly midi: WebMidiService,
    private readonly controls: ControlsService
  ) {
  }

  private noteVelocity(event: KeypressEvent): number {
    if (this.controls.yMod === 'velocity') {
      return event.coordinates && Math.floor(Math.max(Math.min(event.coordinates.y, 1), 0) * 0x7F) || 0x7F;
    } else {
      return this.controls.velocity;
    }
  }

  private commandsForSlide(delta: Point): Array<Array<number>> {
    if (delta && this.controls.xSlideMod === 'channel-pitch-bend') {
      return MidiCommand.pitchBendNorm(this.controls.channel, delta.x);
    } else {
      return [];
    }
  }

  private commandsForSlideCancel(): Array<Array<number>> {
    if (this.controls.xSlideMod === 'channel-pitch-bend') {
      return MidiCommand.resetPitchBend(this.controls.channel);
    } else {
      return [];
    }
  }

  private commandsForEvent(event: KeypressEvent): Array<Array<number>> {
    if (event.eventType === KeypressEventType.Down) {
      return MidiCommand.noteOn(this.controls.channel, event.keyNumber, this.noteVelocity(event));
    } else if (event.eventType === KeypressEventType.Up) {
      this.accum.cancelSlide(event.keyNumber);
      const offCmds = MidiCommand.noteOff(this.controls.channel, event.keyNumber, this.noteVelocity(event)),
            slideCmds = this.commandsForSlideCancel();
      return [...slideCmds, ...offCmds];
    } else if (event.eventType === KeypressEventType.Move) {
      const delta = this.accum.trackKeySlide(event.keyNumber, event.coordinates);
      return this.commandsForSlide(delta);
    }
  }

  processEvent(event: KeypressEvent): void {
    this.commandsForEvent(event).forEach((data) => {
      this.midi.sendData(data);
    });
  }
}
