import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TouchModule } from '../touch/touch.module';
import { TouchService, TouchEvent } from '../touch/touch.service';
import { LayoutService } from '../layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { KeysComponent, KeyEvent, KeyEventType } from './keys.component';

describe('KeysComponent', () => {
  let component: KeysComponent;
  let fixture: ComponentFixture<KeysComponent>;
  let keyEvents: Array<KeyEvent>;
  const firstMidiNote = 21;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TouchModule ],
      declarations: [ KeysComponent ],
      providers: [ TouchService, LayoutService, KeyConfigService ]
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

  it('should emit key down event when a key is pressed', () => {
    const touchstart = new TouchEvent(
      'start',
      'mouse',
      'keys:0',
      {x: 0, y: 0}
    );
    const touchmove = new TouchEvent(
      'move',
      'mouse',
      'keys:1',
      {x: 3, y: 0}
    );
    const touchend = new TouchEvent(
      'end',
      'mouse',
      'keys:1',
      {x: 3, y: 0}
    );

    const key1DownEvent = new KeyEvent(KeyEventType.Down, firstMidiNote);
    const key1UpEvent = new KeyEvent(KeyEventType.Up, firstMidiNote);
    const key2DownEvent = new KeyEvent(KeyEventType.Down, firstMidiNote + 2);
    const key2UpEvent = new KeyEvent(KeyEventType.Up, firstMidiNote + 2);

    expect(keyEvents.length).toEqual(0);
    component.onTouchEvent(touchstart);
    expect(keyEvents[0]).toEqual(key1DownEvent);
    component.onTouchEvent(touchmove);
    expect(keyEvents[1]).toEqual(key1UpEvent);
    expect(keyEvents[2]).toEqual(key2DownEvent);
    component.onTouchEvent(touchend);
    expect(keyEvents[3]).toEqual(key2UpEvent);
    expect(keyEvents.length).toEqual(4);
  });
});
