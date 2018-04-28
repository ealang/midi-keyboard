import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { WebMidiService, Device } from './webmidi.service';
import { ControlsService } from './controls/controls.service';
import { KeypressService, KeypressEvent } from './keypress/keypress.service';
import { PlayService } from './play/play.service';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './g-analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav') sidenav: MatSidenav;

  deviceList = new Array<Device>();
  selectedDeviceId = <string>null;

  constructor(
    readonly controls: ControlsService,
    private readonly keypress: KeypressService,
    private readonly webmidi: WebMidiService,
    private readonly play: PlayService,
    private readonly analytics: GoogleAnalyticsService
  ) {
  }

  ngOnInit(): void {
    if (environment.production) {
      this.analytics.sendPageView();
    }

    this.webmidi.devicesChange.subscribe((devices: Array<Device>) => {
      this.deviceList = devices;
    });
    this.webmidi.deviceLost.subscribe(() => {
      this.selectedDeviceId = null;
    });
    this.webmidi.devices().then((devices: Array<Device>) => {
      this.deviceList = devices;
      const firstDevice = devices[0];
      if (firstDevice) {
        this.selectDevice(firstDevice.id);
      }
    });
    this.keypress.keypressEvent.subscribe((event: KeypressEvent) => {
      this.onKeypressEvent(event);
    });
  }

  repeat(num: number): Array<void> {
    return Array(num);
  }

  selectDevice(deviceId: string): void {
    if (deviceId !== null) {
      this.webmidi.openSession(deviceId).then(() => {
        this.selectedDeviceId = deviceId;
      }, (error: string) => {
        console.log(error);
      });
    }
  }

  onKeypressEvent(event: KeypressEvent): void {
    this.play.processEvent(event);
  }

  onSideNavToggled(): void {
    this.sidenav.toggle();
  }
}
