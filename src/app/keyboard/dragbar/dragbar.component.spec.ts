import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyConfigService } from '../../keyconfig.service';
import { LayoutService } from '../layout/layout.service';
import { DragbarComponent } from './dragbar.component';
import { TouchChangeEvent } from '../touch/touch.directive';

declare var Touch: {
  prototype: Touch;
  new(touchInit: {
    target: HTMLElement,
    identifier: number,
    clientX: number
  }): Touch;
};

describe('DragbarComponent', () => {
  const dummyElem = document.body;
  let component: DragbarComponent;
  let fixture: ComponentFixture<DragbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragbarComponent ],
      providers: [
        KeyConfigService,
        LayoutService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component.scroll, 'emit');
  });

  it('should emit scroll events when mouse is used to scroll', () => {
    component.startScrolling(0, 'mouse');
    expect(component.scroll.emit).not.toHaveBeenCalled();
    component.updateScrolling(10);
    expect(component.scroll.emit).toHaveBeenCalledWith(10);
  });

  it('should emit scroll events when touch is used to scroll', () => {
    const touchstart = new TouchChangeEvent(
      'touchstart',
      new Touch({
        identifier: 101,
        target: dummyElem,
        clientX: 0
      }),
      dummyElem
    );
    const touchmove = new TouchChangeEvent(
      'touchmove',
      new Touch({
        identifier: 101,
        target: dummyElem,
        clientX: 3
      }),
      dummyElem
    );

    component.onTouchEvent(touchstart);
    expect(component.scroll.emit).not.toHaveBeenCalled();
    component.onTouchEvent(touchmove);
    expect(component.scroll.emit).toHaveBeenCalledWith(3);
  });
});
