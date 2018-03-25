import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ControlsService } from './../controls.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  private readonly controls: ControlsService;

  readonly allChannels: Array<number>;

  onRemoveKey(): void {
    this.controls.numVisibleKeys--;
  }

  onAddKey(): void {
    this.controls.numVisibleKeys++;
  }

  get removeKeyDisabled() {
    return this.controls.numVisibleKeys - 1 < this.controls.minVisibleKeys;
  }

  get addKeyDisabled() {
    return this.controls.numVisibleKeys + 1 > this.controls.maxVisibleKeys;
  }

  constructor(controls: ControlsService) {
    this.controls = controls;
    this.allChannels = Array(16);
    for (let i = 0; i < 16; i++) {
      this.allChannels[i] = i;
    }
  }
}
