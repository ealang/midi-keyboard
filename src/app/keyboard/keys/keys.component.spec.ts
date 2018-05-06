import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TouchModule } from '../touch/touch.module';
import { TouchService, TouchEvent } from '../touch/touch.service';
import { LayoutService } from '../layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { KeypressService } from '../../keypress/keypress.service';
import { ControlsService } from '../../controls/controls.service';
import { KeysComponent } from './keys.component';

describe('KeysComponent', () => {
  let component: KeysComponent;
  let fixture: ComponentFixture<KeysComponent>;
  let keyServiceSpy: any;
  const firstMidiNote = 21;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TouchModule ],
      declarations: [ KeysComponent ],
      providers: [
        TouchService,
        LayoutService,
        KeyConfigService,
        KeypressService,
        ControlsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeysComponent);
    component = fixture.componentInstance;
    keyServiceSpy = spyOn(TestBed.get(KeypressService), 'emitEvent');

    fixture.detectChanges();
  });

  it('should emit key events with midi note number attached when a key is pressed', () => {
    const touchstart = new TouchEvent(
      'start',
      'mouse',
      'keys:0',
      {x: 0.1, y: 0},
      {x: 0, y: 0}
    );
    const touchmove = new TouchEvent(
      'move',
      'mouse',
      'keys:1',
      {x: 0.1, y: 0},
      {x: 0, y: 0}
    );
    const touchend = new TouchEvent(
      'end',
      'mouse',
      'keys:1',
      {x: 0.1, y: 0},
      {x: 0, y: 0}
    );

    expect(keyServiceSpy).not.toHaveBeenCalled();
    component.onTouchEvent(touchstart);
    expect(keyServiceSpy).toHaveBeenCalledWith('mouse', firstMidiNote, 'start', {x: 0.1, y: 0});
    component.onTouchEvent(touchmove);
    expect(keyServiceSpy).toHaveBeenCalledWith('mouse', firstMidiNote + 2, 'move', {x: 0.1, y: 0});
    component.onTouchEvent(touchend);
    expect(keyServiceSpy).toHaveBeenCalledWith('mouse', firstMidiNote + 2, 'end', {x: 0.1, y: 0});
  });
});
