import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KeyConfigService } from '../keyconfig.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent {
  private selectedDeviceId_ = <string> null;
  private numVisibleKeys_ = 0;
  minVisibleKeys = 3;
  maxVisibleKeys: number;

  @Input() deviceList: Array<string>;

  @Input() set selectedDeviceId(deviceId: string) {
    this.selectedDeviceId_ = deviceId;
    this.selectedDeviceIdChange.emit(deviceId);
  }

  get selectedDeviceId() {
    return this.selectedDeviceId_;
  }

  @Output() selectedDeviceIdChange = new EventEmitter<string>();

  @Input() set numVisibleKeys(num: number) {
    this.numVisibleKeys_ = num;
    this.numVisibleKeysChange.emit(num);
  }

  get numVisibleKeys() {
    return this.numVisibleKeys_;
  }

  @Output() numVisibleKeysChange = new EventEmitter<number>();

  onRemoveKey(): void {
    this.numVisibleKeys--;
  }

  onAddKey(): void {
    this.numVisibleKeys++;
  }

  get placeholder() {
    return this.selectedDeviceId === null ?
      'Output Device' : undefined;
  }

  get deviceListDisabled() {
    return this.deviceList.length === 0;
  }

  get removeKeyDisabled() {
    return this.numVisibleKeys - 1 < this.minVisibleKeys;
  }

  get addKeyDisabled() {
    return this.numVisibleKeys + 1 > this.maxVisibleKeys;
  }

  constructor(keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
  }
}
