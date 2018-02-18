import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TouchDirective, TouchChangeEvent } from '../touch/touch.directive';
import { ResizeDirective } from '../resize/resize.directive';
import { KeyboardComponent, KeyEvent, KeyEventType } from './keyboard.component';

declare var Touch: {
  prototype: Touch;
  new(touchInit: {
    target: HTMLElement,
    identifier: number
  }): Touch;
};

describe('KeyboardComponent', () => {
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;
  let keyEvents: Array<KeyEvent>;

  const queryAllKeys = () => {
    return fixture.debugElement.queryAll(By.css('span.key'));
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TouchDirective,
        ResizeDirective,
        KeyboardComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    component.keyStart = 12;
    component.keySize = 100;
    component.onResize({width: 1000, height: 200});
    fixture.detectChanges();

    keyEvents = [];
    component.keyEvent.subscribe((e: KeyEvent) => keyEvents.push(e));
  });

  it('should add more keys if window is expanded', () => {
    const numKeys1 = queryAllKeys().length;
    component.onResize({width: 1500, height: 200});
    fixture.detectChanges();
    const numKeys2 = queryAllKeys().length;

    expect(numKeys1).toEqual(13);
    expect(numKeys2).toEqual(22);
    expect(numKeys2).toBeGreaterThan(numKeys1);
  });

  it('should remove keys if key scale is increased', () => {
    const numKeys1 = queryAllKeys().length;
    component.keySize = 200;
    fixture.detectChanges();
    const numKeys2 = queryAllKeys().length;

    expect(numKeys2).toBeLessThan(numKeys1);
  });

  it('should emit key down event when a key is touched', () => {
    const firstKeyElem = fixture.debugElement.query(By.css('span.key'));
    const touchEvent: Touch = new Touch({
      identifier: 101,
      target: document.body
    });
    component.onTouchEvent(new TouchChangeEvent('touchstart', touchEvent, firstKeyElem.nativeElement));
    expect(keyEvents).toEqual([new KeyEvent(KeyEventType.Down, 12)]);
  });

  it('should emit key down event when a key is clicked', () => {
    const expectedKeyDownEvent = new KeyEvent(KeyEventType.Down, 12);
    const expectedKeyUpEvent = new KeyEvent(KeyEventType.Up, 12);

    component.onMouseDown(0);
    expect(keyEvents).toEqual([expectedKeyDownEvent]);
    component.onMouseUp();
    expect(keyEvents).toEqual([expectedKeyDownEvent, expectedKeyUpEvent]);
  });
});
