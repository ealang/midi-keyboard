import { Component, Input, ElementRef, OnInit } from '@angular/core';

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
export class KeysComponent implements OnInit {
  private scrollActiveValue = false;
  private keyNumToIndex;
  private minikeysValue = false;
  touchElemId = 'keys';
  keys: Array<KeyViewModel>;
  labelFontSize: number;

  @Input() scrollPosition = 0;

  @Input() set minikeys(enabled: boolean) {
    if (enabled !== this.minikeys) {
      this.minikeysValue = enabled;
      this.regenerateKeys();
    }
  }
  get minikeys(): boolean {
    return this.minikeysValue;
  }

  @Input() set scrollActive(active: boolean) {
    this.scrollActiveValue = active;
    if (active) {
      this.keypress.freezeAll();
    }
  }
  get scrollActive(): boolean {
    return this.scrollActiveValue;
  }

  constructor(
    touch: TouchService,
    private readonly layout: LayoutService,
    private readonly keyconfig: KeyConfigService,
    private readonly keypress: KeypressService,
    private readonly element: ElementRef
  ) {
    this.labelFontSize = layout.labelFontSize;

    keypress.keypressEvent.subscribe((event: KeypressEvent) => {
      this.onKeypressEvent(event);
    });
    touch.subscribeOrigin(this.touchElemId, (event: TouchEvent) => {
      this.onTouchEvent(event);
    });
  }

  ngOnInit(): void {
    this.regenerateKeys();
  }

  onTouchEvent(event: TouchEvent): void {
    const keyNumber = this.parseKeyFromElemId(event.elemId);
    this.keypress.emitEvent(
      event.touchId,
      keyNumber,
      event.eventType,
      event.elemRelCoordinates
    );
    if (this.scrollActive) {
      this.keypress.freezeAll();
    }
  }

  onKeypressEvent(event: KeypressEvent): void {
    const keyNumber = event.keyNumber,
          keyIndex = this.keyNumToIndex.get(keyNumber),
          key = this.keys[keyIndex];
    key.held = event.eventType !== KeypressEventType.Up;
  }

  private regenerateKeys(): void {
    this.keys = createDefaultKeys(this.layout, this.keyconfig, this.minikeys);
    this.keyNumToIndex = new Map<number, number>(
      this.keys.map((key, i) => <[number, number]>[key.keyNumber, i])
    );
  }

  private parseKeyFromElemId(elemId: ElemId): number {
    return elemId && this.keys[
      Number(elemId.split(':')[1])
    ].keyNumber;
  }
}
