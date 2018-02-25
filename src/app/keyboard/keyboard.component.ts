import { Component, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { TouchChangeEvent } from '../touch/touch.directive';
import { TouchStack, TouchStackEvent } from './touchstack';
import { KeysViewModel } from './keys.viewmodel';
import { LayoutService } from './layout/layout.service';
import { KeyConfigService } from '../keyconfig.service';

export enum KeyEventType {
  Down, Up
}

export class KeyEvent {
  eventType: KeyEventType;
  keyNumber: number;
  constructor(eventType: KeyEventType, keyNumber: number) {
    this.eventType = eventType;
    this.keyNumber = keyNumber;
  }
}

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {
  private static readonly touchEventToEventStackType = new Map<string, TouchStackEvent>([
    ['touchstart', TouchStackEvent.Down],
    ['touchmove', TouchStackEvent.Move],
    ['touchend', TouchStackEvent.Up],
    ['touchcancel', TouchStackEvent.Up],
  ]);
  private static scrollAmplifier = 2;
  private static readonly mouseId = 'mouse';
  private touches: TouchStack;
  private mouseDown = false;
  private svgElement: SVGGraphicsElement = null;
  keys: KeysViewModel;
  keyboardTranslation = 0;
  scrollActive = false;

  @Output() scrollPositionChange = new EventEmitter<number>();

  @Input() set scrollPosition(pos: number) {
    this.scrollPositionChange.emit(pos);
    this.keyboardTranslation = this.boundKeyboardTranslation(
      -pos * this.layout.whiteKeyWidth
    );
  }

  @Input() set numVisibleKeys(num: number) {
    this.keys.numVisibleKeys = num;
    this.resetKeyboard();
    this.keyboardTranslation = this.boundKeyboardTranslation(
      this.keyboardTranslation
    );
  }

  @Output() keyEvent = new EventEmitter<KeyEvent>();

  private static getKeyIndexFromElement(element: Element): number {
    if (element !== null) {
      const attr = element.attributes.getNamedItem('data-keyindex');
      if (attr) {
        return Number(attr.value);
      }
    }
    return null;
  }

  constructor(
    private readonly layout: LayoutService,
    private readonly keyconfig: KeyConfigService,
    private readonly element: ElementRef
  ) {
    this.keys = new KeysViewModel(layout, keyconfig);
    const onKeyDown = (keyIndex: number) => {
      const key = this.keys.keys[keyIndex];
      key.held = true;
      this.keyEvent.emit(new KeyEvent(KeyEventType.Down, key.keyNumber));
    };
    const onKeyUp = (keyIndex: number) => {
      const key = this.keys.keys[keyIndex];
      key.held = false;
      this.keyEvent.emit(new KeyEvent(KeyEventType.Up, key.keyNumber));
    };
    this.touches = new TouchStack(onKeyDown, onKeyUp);
    this.resetKeyboard();
  }

  ngOnInit(): void {
    this.svgElement = this.element.nativeElement.querySelector('svg');
  }

  private boundKeyboardTranslation(translation: number): number {
    return Math.max(
      Math.min(0, translation),
      (this.keys.numVisibleKeys - this.keyconfig.numWhiteKeys) * this.layout.whiteKeyWidth
    );
  }

  private resetKeyboard(): void {
    this.touches.reset();
    this.mouseDown = false;
    this.keys.resetKeyState();
  }

  onMouseDown(keyIndex: number): void {
    this.mouseDown = true;
    this.touches.push(KeyboardComponent.mouseId, keyIndex, TouchStackEvent.Down);
  }

  onMouseUp(): void {
    this.mouseDown = false;
    this.touches.push(KeyboardComponent.mouseId, null, TouchStackEvent.Up);
  }

  onMouseOver(keyIndex: number): void {
    if (this.mouseDown) {
      this.touches.push(KeyboardComponent.mouseId, keyIndex, TouchStackEvent.Move);
    }
  }

  onMouseOut(): void {
    if (this.mouseDown) {
      this.mouseDown = false;
      this.touches.push(KeyboardComponent.mouseId, null, TouchStackEvent.Up);
    }
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const eventType = KeyboardComponent.touchEventToEventStackType.get(event.eventType),
          touchedKeyIndex = KeyboardComponent.getKeyIndexFromElement(event.element),
          identifier = event.identifier.toString();
    this.touches.push(identifier, touchedKeyIndex, eventType);
    if (this.scrollActive) {
      this.touches.freezeAll();
    }
  }

  onDragbarScroll(pxlDelta: number): void {
    const matrix = this.svgElement.getScreenCTM().inverse();
    const pxlToSvgPt = (x: number) => {
      const pt = this.svgElement['createSVGPoint']();
      pt.x = x;
      return pt.matrixTransform(matrix).x;
    };
    const svgPtDelta = pxlToSvgPt(pxlDelta) - pxlToSvgPt(0);
    this.keyboardTranslation = this.boundKeyboardTranslation(
      this.keyboardTranslation + svgPtDelta * KeyboardComponent.scrollAmplifier,
    );
    this.scrollPosition = -this.keyboardTranslation / this.layout.whiteKeyWidth;
  }

  onScrollStatusChanged(scrolling: boolean): void {
    this.scrollActive = scrolling;
    if (scrolling) {
      this.touches.freezeAll();
    }
  }
}
