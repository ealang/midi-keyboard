import { Component, HostListener } from '@angular/core';
import { WebMidiService, Device, DeviceSession } from './webmidi.service';
import { KeypressService, KeypressEvent, KeypressEventType } from './keypress/keypress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private session: DeviceSession;
  deviceList = new Array<Device>();
  selectedDeviceId = <string> null;
  numVisibleKeys = 12;

  constructor(keypress: KeypressService, private readonly webmidi: WebMidiService) {
    this.webmidi.onDevicesChanged((devices: Array<Device>) => {
      this.deviceList = devices;
    });
    this.webmidi.onSessionLost(() => {
      this.session = null;
      this.selectedDeviceId = null;
    });
    this.webmidi.devices().then((devices: Array<Device>) => {
      this.deviceList = devices;
      const firstDevice = devices[0];
      if (firstDevice) {
        this.selectDevice(firstDevice.id);
      }
    });
    keypress.keypressEvent.subscribe((event: KeypressEvent) => {
      this.onKeypressEvent(event);
    });
  }

  selectDevice(deviceId: string): void {
    this.session = null;
    this.selectedDeviceId = deviceId;
    if (deviceId !== null) {
      this.webmidi.openSession(deviceId).then((session: DeviceSession) => {
        this.session = session;
      }, (error: string) => {
        console.log(error);
        this.selectedDeviceId = null;
      });
    }
  }

  onKeypressEvent(event: KeypressEvent): void {
    if (this.session) {
      const vel = event.coordinates && Math.floor(Math.max(Math.min(event.coordinates.y, 1), 0) * 0x7F) || 0x7F;
      if (event.eventType === KeypressEventType.Down) {
        this.session.send([0x90, event.keyNumber, vel]);
      } else if (event.eventType === KeypressEventType.Up) {
        this.session.send([0x80, event.keyNumber, vel]);
      }
    }
  }
}
