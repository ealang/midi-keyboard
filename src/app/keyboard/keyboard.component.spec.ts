import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LayoutService } from './layout/layout.service';
import { KeyConfigService } from '../keyconfig.service';
import { TouchDirective, TouchChangeEvent } from './touch/touch.directive';
import { KeyboardComponent, KeyEvent, KeyEventType } from './keyboard.component';

declare var Touch: {
  prototype: Touch;
  new(touchInit: {
    target: HTMLElement,
    identifier: number
  }): Touch;
};

describe('KeyboardComponent', () => {
  const firstMidiNote = 21;
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;
  let keyEvents: Array<KeyEvent>;
  const getTranslation = () => {
    const xformRe = new RegExp('translate\\((.*?)\\)'),
          keyboard = fixture.debugElement.query(By.css('g'));
    return Number(xformRe.exec(keyboard.attributes.transform)[1]);
  };
  const getVBox = () => {
    const vb = fixture.debugElement.query(By.css('svg')).attributes.viewBox;
    const [x, y, w, h] = vb.split(',').map((i) => Number(i));
    return {x, y, w, h};
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KeyboardComponent
      ],
      providers: [
        LayoutService,
        KeyConfigService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    component.scrollPosition = 0;
    component.numVisibleKeys = 7;
    fixture.detectChanges();

    keyEvents = [];
    component.keyEvent.subscribe((e: KeyEvent) => keyEvents.push(e));
  });

  it('should render all 88 keys', () => {
    const allKeys = fixture.debugElement.queryAll(By.css('rect.key'));
    expect(allKeys.length).toEqual(88);
  });

  it('should change the keyboard offset when scrolling to the right', () => {
    const keyboard = fixture.debugElement.query(By.css('g'));
    const translate1 = getTranslation();
    component.scrollPosition = 1;
    fixture.detectChanges();
    const translate2 = getTranslation();

    expect(translate1).toBeGreaterThan(translate2);
  });

  it('should change the viewbox when zooming out', () => {
    const vb1 = getVBox();
    component.numVisibleKeys = 8;
    fixture.detectChanges();

    const vb2 = getVBox();
    expect(vb1.x).toEqual(vb2.x);
    expect(vb1.y).toEqual(vb2.y);
    expect(vb1.w).toBeLessThan(vb2.w);
    expect(vb1.h).toEqual(vb2.h);
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

  it('should scroll keyboard when dragbar is scrolled', () => {
    const keyboard = fixture.debugElement.query(By.css('g'));
    const translate1 = getTranslation();
    component.onDragbarScroll(-100);
    fixture.detectChanges();
    const translate2 = getTranslation();

    expect(translate1).toBeGreaterThan(translate2);
  });
});
