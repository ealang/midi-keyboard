import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ControlsService } from './../controls.service';
import { KeyConfigService } from '../../keyconfig.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  readonly controls: ControlsService;

  readonly allChannels: Array<number>;

  onRemoveKey(): void {
    this.controls.numVisibleKeys.value--;
  }

  onAddKey(): void {
    this.controls.numVisibleKeys.value++;
  }

  get removeKeyDisabled() {
    return this.controls.numVisibleKeys.value - 1 < 3;
  }

  get addKeyDisabled() {
    return this.controls.numVisibleKeys.value + 1 > this.keyConfig.numWhiteKeys;
  }

  constructor(controls: ControlsService, private keyConfig: KeyConfigService) {
    this.controls = controls;
    this.allChannels = Array(16);
    for (let i = 0; i < 16; i++) {
      this.allChannels[i] = i;
    }
  }
}
