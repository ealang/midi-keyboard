import { Component } from '@angular/core';
import { WebMidiService } from './webmidi.service';
import { TouchChangeEvent } from './touch/touch.directive';

class PianoKey {
  midiNote: number;
  black: boolean;
  constructor(midiNote) {
    this.midiNote = midiNote;
    const i = midiNote % 12;
    this.black = i === 1 || i === 3 || i === 6 || i === 8 || i === 10;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  keys: Array<PianoKey>;
  device: WebMidi.MIDIOutput;
  deviceName: string;

  private heldNotes = new Map<number, number>();

  constructor(private webmidi: WebMidiService) {
    this.keys = [];
    for (let i = 12 * 3; i < 24 + 12 * 3; i++) {
      this.keys.push(new PianoKey(i));
    }

    if (webmidi.isSupported) {
      webmidi.onstatechange((e: WebMidi.MIDIConnectionEvent) => {
        console.log('onstatechange', e);
      });

      webmidi.outputs().then((devices) => {
        if (devices.size >= 1) {
          this.deviceName = devices.keys().next().value;
          this.device = devices.get(this.deviceName);
        }
      });
    }
  }

  private sendNoteOn(midiNote: number): void {
    this.device.send([0x90, midiNote, 0x7F], 0);
  }

  private sendNoteOff(midiNote: number): void {
    this.device.send([0x80, midiNote, 0x7F], 0);
  }

  private getMidiNoteAtCoord(clientX: number, clientY: number): number | null {
    const elem = document.elementFromPoint(clientX, clientY);
    if (elem) {
      const note = elem.dataset.midinote;
      if (note !== undefined) {
        return note;
      }
    }
    return null;
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const screenMidiNote = this.getMidiNoteAtCoord(event.touch.clientX, event.touch.clientY),
          existingMidiNote = this.heldNotes.get(event.identifier),
          isValidNote = screenMidiNote !== null,
          isExistingTouch = existingMidiNote !== undefined;

    if (event.eventType === 'touchstart' && isValidNote) {
      if (isExistingTouch) {
        this.sendNoteOff(existingMidiNote);
      }
      this.sendNoteOn(screenMidiNote);
      this.heldNotes.set(event.identifier, screenMidiNote);
    } else if (event.eventType === 'touchmove') {
      if (isValidNote && existingMidiNote !== screenMidiNote) {
        this.sendNoteOff(existingMidiNote);
        this.sendNoteOn(screenMidiNote);
        this.heldNotes.set(event.identifier, screenMidiNote);
      }
    } else if ((event.eventType === 'touchend' || event.eventType === 'touchcancel') && isExistingTouch) {
      this.heldNotes.delete(event.identifier);
      this.sendNoteOff(existingMidiNote);
    }
  }
}
