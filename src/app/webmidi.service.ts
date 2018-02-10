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

  onstatechange(callback: (e: WebMidi.MIDIConnectionEvent) => void) {
    this.midiAccess.then((access) => {
      access.onstatechange = callback;
    });
  }

  outputs(): Promise<Map<String, WebMidi.MIDIOutput>> {
    return this.midiAccess.then(
      (access) => access.outputs,
      () => new Map()
    );
  }
}
