import { Component, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { LayoutService } from './layout/layout.service';
import { KeyConfigService } from '../keyconfig.service';
import { KeyEvent } from './keys/keys.component';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {
  private static scrollAmplifier = 2;
  private svgElement: SVGGraphicsElement = null;
  private numVisibleKeys_ = 0;

  scrollActive = false;
  scrollPosition = 0;
  viewBox: Array<number> = [0, 0, 0, 0];

  @Input() set numVisibleKeys(num: number) {
    this.numVisibleKeys_ = num;
    this.viewBox = this.calcViewBox();
    this.scrollPosition = this.boundScrollPosition(this.scrollPosition);
  }

  @Output() keyEvent = new EventEmitter<KeyEvent>();

  constructor(
    private readonly layout: LayoutService,
    private readonly keyconfig: KeyConfigService,
    private readonly element: ElementRef
  ) {
    this.scrollPosition = this.boundScrollPosition(
      -keyconfig.initScrollPosition * layout.whiteKeyWidth
    );
  }

  private calcViewBox(): Array<number> {
    const w = this.numVisibleKeys_ * this.layout.whiteKeyWidth;
    return [0, 0, w, this.layout.keyboardHeight];
  }

  private boundScrollPosition(position: number): number {
    return Math.max(
      Math.min(0, position),
      -(this.keyconfig.numWhiteKeys - this.numVisibleKeys_) * this.layout.whiteKeyWidth
    );
  }

  ngOnInit(): void {
    this.svgElement = this.element.nativeElement.querySelector('svg');
  }

  onKeyEvent(event: KeyEvent) {
    this.keyEvent.emit(event);
  }

  onDragbarScroll(pxlDelta: number): void {
    const matrix = this.svgElement.getScreenCTM().inverse();
    const pxlToSvgPt = (x: number) => {
      const pt = this.svgElement['createSVGPoint']();
      pt.x = x;
      return pt.matrixTransform(matrix).x;
    };
    const scrollDelta = (pxlToSvgPt(pxlDelta) - pxlToSvgPt(0)) * KeyboardComponent.scrollAmplifier,
          newScrollPosition = this.scrollPosition + scrollDelta;
    this.scrollPosition = this.boundScrollPosition(newScrollPosition);
  }
}
