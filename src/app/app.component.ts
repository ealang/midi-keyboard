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
  view = {
    numVisibleKeys: 12,
    minVisibleKeys: 4,
    maxVisibleKeys: <number> null,
    scrollPosition: <number> null,
    deviceList: new Array<Device>(),
    selectedDeviceId: <string> null
  };
  private session: DeviceSession;

  constructor(private readonly webmidi: WebMidiService, private readonly keyconfig: KeyConfigService) {
    this.view.maxVisibleKeys = keyconfig.numWhiteKeys;
    this.view.scrollPosition = Math.floor(keyconfig.numWhiteKeys / 2 - this.view.numVisibleKeys / 2);
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

  onRemoveKey() {
    this.view.numVisibleKeys--;
  }

  onAddKey() {
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

