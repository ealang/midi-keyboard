import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TouchService, TouchEvent } from '../touch/touch.service';
import { DragbarService } from './dragbar.service';

describe('DragbarService', () => {
  let touch: TouchService;
  let dragbar: DragbarService;

  beforeEach(() => {
    touch = new TouchService();
    dragbar = new DragbarService(touch);

    spyOn(dragbar.scroll, 'emit');
    spyOn(dragbar.scrollActive, 'emit');
  });

  it('should emit scroll events when user scrolls', () => {
    expect(dragbar.scrollActive.emit).not.toHaveBeenCalled();

    touch.emitEvent(
      'start',
      'mouse',
      dragbar.touchElemId,
      {x: 0, y: 0}
    );
    expect(dragbar.scroll.emit).not.toHaveBeenCalled();
    expect(dragbar.scrollActive.emit).toHaveBeenCalledWith(true);

    touch.emitEvent(
      'move',
      'mouse',
      dragbar.touchElemId,
      {x: 3, y: 0}
    );
    expect(dragbar.scroll.emit).toHaveBeenCalledWith(3);

    touch.emitEvent(
      'end',
      'mouse',
      dragbar.touchElemId,
      {x: 3, y: 0}
    );
    expect(dragbar.scrollActive.emit).toHaveBeenCalledWith(false);
  });
});
