import { Component, HostListener } from '@angular/core';
import { WebMidiService, Device, DeviceSession } from './webmidi.service';
import { KeyEvent, KeyEventType } from './keyboard/keyboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  view = {
    numVisibleKeys: 14,
    viewPosition1: 23,
    viewPosition2: 9,
    deviceList: new Array<Device>(),
    selectedDeviceId: <string> null,
  };
  private session: DeviceSession;

  constructor(private webmidi: WebMidiService) {
    this.webmidi.onDevicesChanged((devices: Array<Device>) => {
      this.view.deviceList = devices;
    });
    this.webmidi.onSessionLost(() => {
      this.session = null;
      this.view.selectedDeviceId = null;
    });
    this.webmidi.devices().then((devices: Array<Device>) => {
      this.view.deviceList = devices;
      const firstDevice = devices[0];
      if (firstDevice) {
        this.view.selectedDeviceId = firstDevice.id;
        this.onDeviceSelected(firstDevice.id);
      }
    });
  }

  onDecreaseKeySize() {
    this.view.numVisibleKeys--;
  }

  onIncreaseKeySize() {
    this.view.numVisibleKeys++;
  }

  onDeviceSelected(deviceId: string): void {
    this.session = null;
    this.webmidi.openSession(deviceId).then((session: DeviceSession) => {
      this.session = session;
    }, (error: string) => {
      console.log(error);
      this.view.selectedDeviceId = null;
    });
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

