import { Injectable } from '@angular/core';

@Injectable()
export class WebMidiService {
  private midiAccess: Promise<WebMidi.MIDIAccess>;

  midiSupported: boolean;

  constructor() {
    this.midiSupported = window.navigator.requestMIDIAccess !== undefined;
    this.midiAccess =
      (this.midiSupported) ?
        window.navigator.requestMIDIAccess() :
        Promise.reject('Midi is not supported');
  }

  getOutputDevices(): Promise<Array<String>> {
    return this.midiAccess.then(
      (access) => {
        return Array.from(access.outputs.values()).map((device) => {
          return device.id;
        });
      },
      () => []
    );
  }

}
