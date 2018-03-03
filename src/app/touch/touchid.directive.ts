import { Directive, Input, HostBinding } from '@angular/core';

@Directive({
  selector: '[appTouchId]'
})
export class TouchIdDirective {
  @HostBinding('attr.data-touch-id')
  @Input() appTouchId: string;
}
