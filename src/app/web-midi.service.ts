import { Injectable } from '@angular/core';

@Injectable()
export class WebMidiService {

  constructor() {
    window.navigator.requestMIDIAccess().then(
      function (midiAccess: WebMidi.MIDIAccess) {
        midiAccess.outputs.forEach(console.log);

      },
      function (msg: any) {
        console.log(msg);
      }
    );
  }

}
