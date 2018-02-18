import { ElementRef } from '@angular/core';
import { ResizeDirective } from './resize.directive';

describe('ResizeDirective', () => {
  it('removes event listener when directive is destroyed', () => {
    const dummyElem = document.body,
          directive = new ResizeDirective(
            new ElementRef(dummyElem)
          ),
          spy = spyOn(directive, 'emitSize'),
          resizeEvent = new Event('resize');

    directive.ngOnInit();
    expect(spy.calls.count()).toEqual(1);

    window.dispatchEvent(resizeEvent);
    expect(spy.calls.count()).toEqual(2);

    directive.ngOnDestroy();
    expect(spy.calls.count()).toEqual(2);

    window.dispatchEvent(resizeEvent);
    expect(spy.calls.count()).toEqual(2);
  });
});
