import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { Option, none, some } from 'ts-option';

export interface Device {
  id: string;
  name: string;
}

@Injectable()
export class WebMidiService implements OnInit {
  private openDevice: Option<WebMidi.MIDIOutput> = none;
  private midiAccess: Promise<WebMidi.MIDIAccess>;

  isSupported: boolean;
  devicesChange = new EventEmitter<Array<Device>>();
  deviceLost = new EventEmitter<void>();

  deviceOpened = new EventEmitter<void>();

  constructor() {
    this.isSupported = window.navigator.requestMIDIAccess !== undefined;

    this.midiAccess =
      (this.isSupported) ?
        window.navigator.requestMIDIAccess() :
        Promise.reject('Midi is not supported');
  }

  ngOnInit(): void {
    this.midiAccess.then((access: WebMidi.MIDIAccess) => {
      access.onstatechange = (event) => {
        this.onStateChange(access, event);
      };
    });
  }

  sendData(commands: Array<Array<number>>): void {
    this.openDevice.forEach((device) => {
      commands.forEach((data) => {
        device.send(data, 0);
      });
    });
  }

  devices(): Promise<Array<Device>> {
    return this.midiAccess.then(access => {
      return this.parseDevices(access);
    });
  }

  openSession(deviceId: string): Promise<void> {
    this.openDevice.forEach((device) => {
      device.close();
    });
    this.openDevice = none;
    return this.midiAccess.then(access => {
      const device = access.outputs.get(deviceId);
      device.open();
      this.deviceOpened.emit();
      this.openDevice = some(device);
    });
  }

  private parseDevices(access: WebMidi.MIDIAccess): Array<Device> {
    const devices = access.outputs;
    return Array.from(devices.values()).map(device => {
      return {id: device.id, name: device.name};
    });
  }

  private onStateChange(access: WebMidi.MIDIAccess, event: WebMidi.MIDIConnectionEvent) {
    const id = event.port.id,
          state = event.port.state;
    if (state === 'disconnected' && this.openDevice.exists((device) => device.id === id)) {
      this.openDevice = none;
      this.deviceLost.emit();
    }
    this.devicesChange.emit(this.parseDevices(access));
  }
}
