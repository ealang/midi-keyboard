import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KeyConfigService } from '../../keyconfig.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  private selectedDeviceId_ = <string> null;

  @Input() deviceList: Array<string>;

  @Input() set selectedDeviceId(deviceId: string) {
    this.selectedDeviceId_ = deviceId;
    this.selectedDeviceIdChange.emit(deviceId);
  }

  get selectedDeviceId() {
    return this.selectedDeviceId_;
  }

  @Output() selectedDeviceIdChange = new EventEmitter<string>();

  @Output() sideNavToggle = new EventEmitter<void>();

  get placeholder() {
    return this.selectedDeviceId === null ?
      'Output Device' : undefined;
  }

  get deviceListDisabled() {
    return this.deviceList.length === 0;
  }

  onSideNavToggled(): void {
    this.sideNavToggle.emit();
  }
}
