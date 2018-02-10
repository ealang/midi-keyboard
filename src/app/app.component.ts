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

  onHitKey(midiNote: number) {
    if (this.device) {
      this.device.send([0x90, midiNote, 0x7F], 0);
      setTimeout(() => {
        this.device.send([0x80, midiNote, 0x7F], 0);
      }, 500);
    }
  }

  onTouchEvent(midiNote: number, event: TouchChangeEvent) {
    if (event.eventType === 'touchstart') {
      this.onHitKey(midiNote);
    }
  }

  constructor(private webmidi: WebMidiService) {
    this.keys = [];
    for (let i = 12 * 3; i < 18 + 12 * 3; i++) {
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
}
