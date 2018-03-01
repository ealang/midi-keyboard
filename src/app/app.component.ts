import { Component, HostListener } from '@angular/core';
import { WebMidiService, Device, DeviceSession } from './webmidi.service';
import { KeyEvent, KeyEventType } from './keyboard/keyboard.component';
import { KeyConfigService } from './keyconfig.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private session: DeviceSession;
  numVisibleKeys = 12;
  minVisibleKeys = 3;
  maxVisibleKeys = <number> null;
  deviceList = new Array<Device>();
  selectedDeviceId = <string> null;
  scrollPosition = <number> null;

  constructor(private readonly webmidi: WebMidiService, keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
    this.scrollPosition = Math.floor(keyconfig.numWhiteKeys / 2 - this.numVisibleKeys / 2);
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

  onKeyEvent(event: KeyEvent): void {
    if (this.session) {
      if (event.eventType === KeyEventType.Down) {
        this.session.send([0x90, event.keyNumber, 0x7F]);
      } else {
        this.session.send([0x80, event.keyNumber, 0x7F]);
      }
    }
  }
}
