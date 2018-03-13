import { Injectable } from '@angular/core';
import { WebMidiService } from './webmidi.service';
import { ControlsService } from './controls/controls.service';
import { MidiCommand, MidiCommandSeq } from './midi-command';
import { KeypressEvent, KeypressEventType } from './keypress/keypress.service';

enum ModType { PitchBend, Pressure, Velocity }

@Injectable()
export class PlayService {
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

  private commandsForEvent(event: KeypressEvent): Array<Array<number>> {
    if (event.eventType === KeypressEventType.Down) {
      return MidiCommand.noteOn(this.controls.channel, event.keyNumber, this.noteVelocity(event));
    } else if (event.eventType === KeypressEventType.Up) {
      return MidiCommand.noteOff(this.controls.channel, event.keyNumber, this.noteVelocity(event));
    } else {
      return [];
    }
  }

  processEvent(event: KeypressEvent): void {
    this.commandsForEvent(event).forEach((data) => {
      this.midi.sendData(data);
    });
  }
}
