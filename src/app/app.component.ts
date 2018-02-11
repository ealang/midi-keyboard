import { Component } from '@angular/core';
import { WebMidiService } from './webmidi.service';
import { KeyEvent, KeyEventType } from './keyboard/keyboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  midiKeyRange1 = [60, 72];
  midiKeyRange2 = [48, 60];
  device: WebMidi.MIDIOutput;
  deviceName: string;

  constructor(private webmidi: WebMidiService) {
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

  onKeyEvent(event: KeyEvent): void {
    if (this.device) {
      if (event.eventType === KeyEventType.Down) {
        this.device.send([0x90, event.keyNumber, 0x7F], 0);
      } else {
        this.device.send([0x80, event.keyNumber, 0x7F], 0);
      }
    }
  }
}
