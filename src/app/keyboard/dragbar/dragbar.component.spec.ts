import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TouchModule } from '../../touch/touch.module';
import { TouchService, TouchEvent } from '../../touch/touch.service';
import { KeyConfigService } from '../../keyconfig.service';
import { LayoutService } from '../layout/layout.service';
import { DragbarComponent } from './dragbar.component';

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
      imports: [ TouchModule ],
      declarations: [ DragbarComponent ],
      providers: [
        TouchService,
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
    spyOn(component.scrollActive, 'emit');
  });

  it('should emit scroll events when user scrolls', () => {
    const touchstart = new TouchEvent(
      'start',
      'mouse',
      component.touchElemId,
      {x: 0, y: 0}
    );
    const touchmove = new TouchEvent(
      'move',
      'mouse',
      component.touchElemId,
      {x: 3, y: 0}
    );
    const touchend = new TouchEvent(
      'end',
      'mouse',
      component.touchElemId,
      {x: 3, y: 0}
    );

    expect(component.scrollActive.emit).not.toHaveBeenCalled();

    component.onTouchEvent(touchstart);
    expect(component.scroll.emit).not.toHaveBeenCalled();
    expect(component.scrollActive.emit).toHaveBeenCalledWith(true);

    component.onTouchEvent(touchmove);
    expect(component.scroll.emit).toHaveBeenCalledWith(3);

    component.onTouchEvent(touchend);
    expect(component.scrollActive.emit).toHaveBeenCalledWith(false);
  });
});
