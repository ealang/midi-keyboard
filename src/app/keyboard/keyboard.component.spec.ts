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

    let event;
    component.keyEvent.subscribe((e: any) => event = e);

    const touchEvent: Touch = new Touch({
      identifier: 101,
      target: document.body
    });
    component.onTouchEvent(new TouchChangeEvent('touchstart', touchEvent, firstKeyElem.nativeElement));

    expect(event).toEqual(new KeyEvent(KeyEventType.Down, 12));
  });

  it('should ignore touch on a key that is already held', () => {
    const firstKeyElem = fixture.debugElement.query(By.css('span.key'));

    const events = [];
    component.keyEvent.subscribe((e: any) => events.push(e));

    const touchEvent1: Touch = new Touch({
      identifier: 100,
      target: document.body
    });
    const touchEvent2: Touch = new Touch({
      identifier: 101,
      target: document.body
    });
    component.onTouchEvent(new TouchChangeEvent('touchstart', touchEvent1, firstKeyElem.nativeElement));
    expect(events.length).toEqual(1);

    component.onTouchEvent(new TouchChangeEvent('touchstart', touchEvent2, firstKeyElem.nativeElement));
    component.onTouchEvent(new TouchChangeEvent('touchend', touchEvent2, firstKeyElem.nativeElement));
    expect(events.length).toEqual(1);
  });
});
