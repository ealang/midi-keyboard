import { Component, Input, ElementRef } from '@angular/core';

import { LayoutService } from '../layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { KeypressService, KeypressEvent, KeypressEventType } from '../../keypress/keypress.service';

import { TouchService, TouchEvent, ElemId } from '../touch/touch.service';
import { KeyViewModel, createDefaultKeys } from './key.viewmodel';

@Component({
  // tslint:disable-next-line:component-selector (need component to be valid svg)
  selector: '[app-keys]',
  templateUrl: './keys.component.html',
  styleUrls: ['./keys.component.css']
})
export class KeysComponent {
  private scrollActive_ = false;
  private keyNumToIndex;
  touchElemId = 'keys';
  keys: Array<KeyViewModel>;
  labelFontSize: number;

  @Input() scrollPosition = 0;

  @Input() set scrollActive(active: boolean) {
    this.scrollActive_ = active;
    if (active) {
      this.keypress.freezeAll();
    }
  }

  get scrollActive(): boolean {
    return this.scrollActive_;
  }

  constructor(
    layout: LayoutService,
    touch: TouchService,
    private keyconfig: KeyConfigService,
    private readonly keypress: KeypressService,
    private readonly element: ElementRef
  ) {
    this.keys = createDefaultKeys(layout, keyconfig);
    this.keyNumToIndex = new Map<number, number>(
      this.keys.map((key, i) => <[number, number]>[key.keyNumber, i])
    );
    this.labelFontSize = layout.labelFontSize;

    keypress.keypressEvent.subscribe((event: KeypressEvent) => {
      this.onKeypressEvent(event);
    });
    touch.subscribeOrigin(this.touchElemId, (event: TouchEvent) => {
      this.onTouchEvent(event);
    });
  }

  private parseKeyFromElemId(elemId: ElemId): number {
    return elemId && this.keys[
      Number(elemId.split(':')[1])
    ].keyNumber;
  }

  onTouchEvent(event: TouchEvent): void {
    const keyNumber = this.parseKeyFromElemId(event.elemId);
    this.keypress.emitEvent(
      event.touchId,
      keyNumber,
      event.eventType
    );
    if (this.scrollActive_) {
      this.keypress.freezeAll();
    }
  }

  onKeypressEvent(event: KeypressEvent): void {
    const keyNumber = event.keyNumber,
          keyIndex = this.keyNumToIndex.get(keyNumber),
          key = this.keys[keyIndex];
    key.held = event.eventType === KeypressEventType.Down;
  }
}
