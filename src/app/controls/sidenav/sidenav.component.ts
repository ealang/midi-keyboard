import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ControlsService } from './../controls.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  private readonly controls: ControlsService;

  get velocityDisabled(): boolean {
    return this.controls.ymod === 'velocity';
  }

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
  }
}
