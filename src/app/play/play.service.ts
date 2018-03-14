import { Injectable } from '@angular/core';

import { Point } from '../geometry';
import { WebMidiService } from '../webmidi.service';
import { ControlsService } from '../controls/controls.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';

import { MidiCommand, MidiCommandSeq } from './midi-command';
import { SlideAccum } from './slide-accum';

@Injectable()
export class PlayService {
  private readonly accum = new SlideAccum();

  private static applyDeadZone(value: number, deadzone: number): number {
    return Math.abs(value) < deadzone ?
      0 :
      value - Math.sign(value) * deadzone;
  }

  constructor(
    private readonly midi: WebMidiService,
    private readonly controls: ControlsService
  ) {
    controls.channelChange.subscribe(([oldCh, newCh]) => {
      this.processChannelClose(oldCh);
      this.processChannelChanged();
    });
    controls.pitchBendSemiChange.subscribe(() => {
      this.processChannelChanged();
    });
    midi.deviceOpened.subscribe(() => {
      this.processChannelChanged();
    });
    midi.preDeviceClose.subscribe(() => {
      this.processChannelClose(controls.channel);
    });
  }

  private noteVelocity(event: KeypressEvent): number {
    if (this.controls.yMod === 'velocity') {
      return event.coordinates && Math.floor(Math.max(Math.min(event.coordinates.y, 1), 0) * 0x7F) || 0x7F;
    } else {
      return this.controls.velocity;
    }
  }

  private commandsForPreDeviceClose(): MidiCommandSeq {
    return [];
  }

  private commandsForSlide(delta: Point): MidiCommandSeq {
    if (delta && this.controls.xSlideMod === 'channel-pitch-bend') {
      const bend = PlayService.applyDeadZone(delta.x, this.controls.xSlideDeadZone);
      return MidiCommand.pitchBendNorm(this.controls.channel, bend);
    } else {
      return [];
    }
  }

  private commandsForSlideCancel(): MidiCommandSeq {
    if (this.controls.xSlideMod === 'channel-pitch-bend') {
      return MidiCommand.resetPitchBend(this.controls.channel);
    } else {
      return [];
    }
  }

  private commandsForEvent(event: KeypressEvent): MidiCommandSeq {
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

  private sendCommandSeq(commands: MidiCommandSeq): void {
    commands.forEach((data) => {
      this.midi.sendData(data);
    });
  }

  private commandsToConfigureChannel(channel: number): MidiCommandSeq {
    return MidiCommand.pitchBendSensitivity(channel, this.controls.pitchBendSemi);
  }

  processChannelClose(channel: number): void {
    this.sendCommandSeq(MidiCommand.resetAllControllers(channel));
  }

  processChannelChanged(): void {
    this.sendCommandSeq(this.commandsToConfigureChannel(this.controls.channel));
  }

  processEvent(event: KeypressEvent): void {
    this.sendCommandSeq(this.commandsForEvent(event));
  }
}
