import { Component } from '@angular/core';
import { WebMidiService } from './webmidi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  supported: boolean;
  outputs: Array<String>;

  constructor(private webmidi: WebMidiService) {
    this.supported = webmidi.midiSupported;

    webmidi.onstatechange((e: WebMidi.MIDIConnectionEvent) => {
      console.log('onstatechange', e);
    });

    webmidi.outputs().then((devices) => {
      this.outputs = Array.from(devices.keys());
    });
  }
}
