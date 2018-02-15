import { Injectable } from '@angular/core';

export interface Device {
  id: string;
  name: string;
}

export class DeviceSession {
  id: string;

  constructor(private output: WebMidi.MIDIOutput) {
    this.id = output.id;
  }

  send(data: Array<number>): void {
    this.output.send(data, 0);
  }

  close(): void {
    this.output.close();
  }
}

@Injectable()
export class WebMidiService {
  private midiAccess: Promise<WebMidi.MIDIAccess>;
  private currentSession: DeviceSession;
  private _onDevicesChanged: (devices: Array<Device>) => void;
  private _onSessionLost: () => void;
  isSupported: boolean;

  constructor() {
    this.isSupported = window.navigator.requestMIDIAccess !== undefined;
    this.midiAccess =
      (this.isSupported) ?
        window.navigator.requestMIDIAccess() :
        Promise.reject('Midi is not supported');

    this.midiAccess.then((access: WebMidi.MIDIAccess) => {
      access.onstatechange = (event: WebMidi.MIDIConnectionEvent) => {
        const id = event.port.id,
              state = event.port.state;
        if (
          this.currentSession &&
          this.currentSession.id === id &&
          state === 'disconnected' &&
          this._onSessionLost
        ) {
          this._onSessionLost();
        }
        if (this._onDevicesChanged) {
          this.devices().then(this._onDevicesChanged);
        }
      };
    });
  }

  devices(): Promise<Array<Device>> {
    return this.midiAccess.then((access: WebMidi.MIDIAccess) => {
      const devices = access.outputs;
      return Array.from(devices.values()).map(device => {
        return {id: device.id, name: device.name};
      });
    });
  }

  openSession(deviceId: string): Promise<DeviceSession> {
    if (this.currentSession) {
      this.currentSession.close();
      this.currentSession = null;
    }
    return this.midiAccess.then((access: WebMidi.MIDIAccess) => {
      const device = access.outputs.get(deviceId);
      device.open();

      this.currentSession = new DeviceSession(device);
      return this.currentSession;
    });
  }

  onDevicesChanged(callback: (devices: Array<Device>) => void): void {
    this._onDevicesChanged = callback;
  }

  onSessionLost(callback: () => void): void {
    this._onSessionLost = callback;
  }
}
