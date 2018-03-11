import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KeyConfigService } from '../../keyconfig.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  private numVisibleKeys_ = 0;
  minVisibleKeys = 3;
  maxVisibleKeys: number;

  constructor(keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
  }

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

  get removeKeyDisabled() {
    return this.numVisibleKeys - 1 < this.minVisibleKeys;
  }

  get addKeyDisabled() {
    return this.numVisibleKeys + 1 > this.maxVisibleKeys;
  }
}
