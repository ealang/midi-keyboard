import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LayoutService } from '../layout/layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { TouchDirective, TouchChangeEvent } from '../touch/touch.directive';
import { KeysComponent, KeyEvent, KeyEventType } from './keys.component';

declare var Touch: {
  prototype: Touch;
  new(touchInit: {
    target: HTMLElement,
    identifier: number
  }): Touch;
};

describe('KeysComponent', () => {
  let component: KeysComponent;
  let fixture: ComponentFixture<KeysComponent>;
  let keyEvents: Array<KeyEvent>;
  const firstMidiNote = 21;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TouchDirective, KeysComponent ],
      providers: [ LayoutService, KeyConfigService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    keyEvents = [];
    component.keyEvent.subscribe((e: KeyEvent) => keyEvents.push(e));
  });

  it('should emit key down event when a key is touched', () => {
    const firstKeyElem = fixture.debugElement.query(By.css('rect.key'));
    const touchEvent: Touch = new Touch({
      identifier: 101,
      target: document.body
    });
    component.onTouchEvent(new TouchChangeEvent('touchstart', touchEvent, firstKeyElem.nativeElement));
    expect(keyEvents).toEqual([new KeyEvent(KeyEventType.Down, firstMidiNote)]);
  });

  it('should emit key down event when a key is clicked', () => {
    const expectedKeyDownEvent = new KeyEvent(KeyEventType.Down, firstMidiNote);
    const expectedKeyUpEvent = new KeyEvent(KeyEventType.Up, firstMidiNote);

    component.onMouseDown(0);
    expect(keyEvents).toEqual([expectedKeyDownEvent]);
    component.onMouseUp();
    expect(keyEvents).toEqual([expectedKeyDownEvent, expectedKeyUpEvent]);
  });
});
