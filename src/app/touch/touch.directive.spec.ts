import { ElementRef } from '@angular/core';
import { TouchDirective, TouchChangeEvent } from './touch.directive';

declare var Touch: {
  prototype: Touch;
  new(touchInit: {
    target: HTMLElement,
    identifier: number
  }): Touch;
};

class StubbedTouchDirective extends TouchDirective {
  constructor(elem: ElementRef) {
    super(elem);
  }
  protected elementFromPoint(clientX: number, clientY: number): Element {
    return document.body;
  }
}

describe('TouchDirective', () => {
  const dummyElem = document.body;
  const touch1 = new Touch({
    identifier: 100,
    target: dummyElem
  });
  const touch2 = new Touch({
    identifier: 101,
    target: dummyElem
  });
  const makeTestEvent = function(eventType: string) {
    return new TouchEvent('touchstart', {
      changedTouches: [touch1]
    });
  };

  let dir;
  beforeEach(() => {
    dir = new StubbedTouchDirective(new ElementRef(dummyElem));
    spyOn(dir.touch, 'emit');
  });

  it('should emit a touch start event', () => {
    dir.onTouchStart(makeTestEvent('touchstart'));
    expect(dir.touch.emit).toHaveBeenCalledWith(
      new TouchChangeEvent('touchstart', touch1, dummyElem)
    );
  });

  it('should emit a touch move event', () => {
    dir.onTouchMove(makeTestEvent('touchstart'));
    expect(dir.touch.emit).toHaveBeenCalledWith(
      new TouchChangeEvent('touchmove', touch1, dummyElem)
    );
  });

  it('should emit a touch end event', () => {
    dir.onTouchEnd(makeTestEvent('touchend'));
    expect(dir.touch.emit).toHaveBeenCalledWith(
      new TouchChangeEvent('touchend', touch1, dummyElem)
    );
  });

  it('should emit a touch cancel event', () => {
    dir.onTouchCancel(makeTestEvent('touchcancel'));
    expect(dir.touch.emit).toHaveBeenCalledWith(
      new TouchChangeEvent('touchcancel', touch1, dummyElem)
    );
  });

  it('should emit multiple touch move events', () => {
    dir.onTouchMove(new TouchEvent('touchmove', {
      changedTouches: [touch1, touch2]
    }));
    expect(dir.touch.emit).toHaveBeenCalledWith(new TouchChangeEvent(
      'touchmove', touch1, dummyElem
    ));
    expect(dir.touch.emit).toHaveBeenCalledWith(new TouchChangeEvent(
      'touchmove', touch2, dummyElem
    ));
  });
});
