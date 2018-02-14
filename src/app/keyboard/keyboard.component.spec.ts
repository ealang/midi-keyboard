import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TouchDirective, TouchChangeEvent } from '../touch/touch.directive';
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyboardComponent, TouchDirective ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    component.keyRange = [12, 24];
    fixture.detectChanges();

    keyEvents = [];
    component.keyEvent.subscribe((e: KeyEvent) => keyEvents.push(e));
  });

  it('should render the correct number of keys', () => {
    expect(fixture.debugElement.queryAll(By.css('span.key')).length).toBe(12);
  });

  it('should allow number of keys to be updated', () => {
    component.keyRange = [12, 25];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('span.key')).length).toBe(13);
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
