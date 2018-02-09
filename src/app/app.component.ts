import { Component } from '@angular/core';
import { WebMidiService } from './web-midi.service';

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

    webmidi.getOutputDevices().then((devices) => {
      this.outputs = devices;
    });
  }
}
