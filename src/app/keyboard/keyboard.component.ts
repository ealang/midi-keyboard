import { Component, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { DragbarService } from './dragbar/dragbar.service';
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
    dragbar: DragbarService,
    readonly layout: LayoutService,
    private readonly keyconfig: KeyConfigService,
    private readonly element: ElementRef
  ) {
    this.scrollPosition = this.boundScrollPosition(
      -keyconfig.initScrollPosition * layout.whiteKeyWidth
    );
    dragbar.scroll.subscribe((pxlDelta) => {
      this.onDragbarScroll(pxlDelta);
    });
    dragbar.scrollActive.subscribe((active) => {
      this.scrollActive = active;
    });
  }

  private calcViewBox(): Array<number> {
    return [
      0, 0,
      this.numVisibleKeys_ * this.layout.whiteKeyWidth,
      this.layout.whiteKeyHeight + (this.layout.dragBarHeight + this.layout.keyBoardPadding) * 2 + this.layout.dragBarStrokeWidth
    ];
  }

  private boundScrollPosition(position: number): number {
    return Math.max(
      Math.min(0, position),
      -(this.keyconfig.numWhiteKeys - this.numVisibleKeys_) * this.layout.whiteKeyWidth - this.layout.keyStrokeWidth
    );
  }

  ngOnInit(): void {
    this.svgElement = this.element.nativeElement.querySelector('svg');
  }

  onKeyEvent(event: KeyEvent) {
    this.keyEvent.emit(event);
  }

  private onDragbarScroll(pxlDelta: number): void {
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
