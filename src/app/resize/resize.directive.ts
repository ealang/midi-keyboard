import { Directive, ElementRef, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appResize]'
})
export class ResizeDirective implements OnInit, OnDestroy {
  private eventListener: any;

  // tslint:disable-next-line:no-output-rename
  @Output('appResize') resize = new EventEmitter<{width: number, height: number}>();

  constructor(private elemRef: ElementRef) {
    this.eventListener = () => { this.emitSize(); };
    window.addEventListener('resize', this.eventListener);
  }

  private emitSize(): void {
    const dim = this.elemRef.nativeElement.getBoundingClientRect();
    this.resize.emit({width: dim.width, height: dim.height});
  }

  ngOnInit(): void {
    this.emitSize();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.eventListener);
  }
}
