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

  private static bound(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
  }

  private static normToMidi(normValue: number, invert: boolean): number {
    return Math.floor(PlayService.bound(invert ? 1 - normValue : normValue, 0, 1) * 127);
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
      return (event.coordinates && PlayService.normToMidi(event.coordinates.y, this.controls.yModInvert)) || 0x7F;
    } else {
      return this.controls.velocity;
    }
  }

  private commandsForCurrentPressure(event: KeypressEvent): MidiCommandSeq {
      const pressure = (event.coordinates && PlayService.normToMidi(event.coordinates.y, this.controls.yModInvert)) || 0;
      return MidiCommand.polyphonicKeyPressure(this.controls.channel, event.keyNumber, pressure);
  }

  private commandsForPreDeviceClose(): MidiCommandSeq {
    return [];
  }

  private commandsForSlide(event: KeypressEvent, delta: Point): MidiCommandSeq {
    const yCmds = (this.controls.yMod === 'pressure') ?
      this.commandsForCurrentPressure(event) : [];

    const xCmds = (delta && this.controls.xSlideMod === 'channel-pitch-bend') ?
      (() => {
        const bend = PlayService.applyDeadZone(PlayService.bound(delta.x, -1, 1), this.controls.xSlideDeadZone);
        return MidiCommand.pitchBendNorm(this.controls.channel, bend);
      })() : [];

    return [...yCmds, ...xCmds];
  }

  private commandsForSlideCancel(): MidiCommandSeq {
    if (this.controls.xSlideMod === 'channel-pitch-bend') {
      return MidiCommand.resetPitchBend(this.controls.channel);
    } else {
      return [];
    }
  }

  private commandsForNoteOn(event: KeypressEvent): MidiCommandSeq {
    const pressureCmds = this.controls.yMod === 'pressure' ? this.commandsForCurrentPressure(event) : [];
    return [
      ...pressureCmds,
      ...MidiCommand.noteOn(this.controls.channel, event.keyNumber, this.noteVelocity(event))
    ];
  }

  private commandsForEvent(event: KeypressEvent): MidiCommandSeq {
    if (event.eventType === KeypressEventType.Down) {
      return this.commandsForNoteOn(event);
    } else if (event.eventType === KeypressEventType.Up) {
      this.accum.cancelSlide(event.keyNumber);
      const offCmds = MidiCommand.noteOff(this.controls.channel, event.keyNumber, this.noteVelocity(event)),
            slideCmds = this.commandsForSlideCancel();
      return [...slideCmds, ...offCmds];
    } else if (event.eventType === KeypressEventType.Move) {
      const delta = this.accum.trackKeySlide(event.keyNumber, event.coordinates);
      return this.commandsForSlide(event, delta);
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
