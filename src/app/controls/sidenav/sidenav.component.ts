import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KeyConfigService } from '../../keyconfig.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  private readonly minVelocity = 1;
  private readonly maxVelocity = 127;
  private readonly minVisibleKeys = 3;
  private readonly maxVisibleKeys: number;

  private numVisibleKeys_;
  private velocity_;
  private ymod_;

  @Input() set numVisibleKeys(num: number) {
    this.numVisibleKeys_ = num;
    this.numVisibleKeysChange.emit(num);
  }

  get numVisibleKeys(): number {
    return this.numVisibleKeys_;
  }

  @Output() numVisibleKeysChange = new EventEmitter<number>();

  @Input() set velocity(num: number) {
    this.velocity_ = num;
    this.velocityChange.emit(num);
  }

  get velocity(): number {
    return this.velocity_;
  }

  @Output() velocityChange = new EventEmitter<number>();

  get velocityDisabled(): boolean {
    return this.ymod === 'velocity';
  }

  @Input() set ymod(option: string) {
    this.ymod_ = option;
    this.ymodChange.emit(option);
  }

  get ymod(): string {
    return this.ymod_;
  }

  @Output() ymodChange = new EventEmitter<string>();

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

  constructor(keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
  }
}
