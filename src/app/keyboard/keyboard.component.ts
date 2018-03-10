import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { TouchService } from './touch/touch.service';
import { DragbarService } from './dragbar/dragbar.service';
import { LayoutService } from './layout.service';
import { KeyConfigService } from '../keyconfig.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css'],
  providers: [
    LayoutService,
    TouchService,
    DragbarService
  ],
})
export class KeyboardComponent {
  private static scrollAmplifier = 2;
  private numVisibleKeys_ = 0;

  scrollActive = false;
  scrollPosition = 0;
  viewBox: Array<number> = [0, 0, 0, 0];

  @Input() set numVisibleKeys(num: number) {
    this.numVisibleKeys_ = num;
    this.viewBox = this.calcViewBox();
    this.scrollPosition = this.boundScrollPosition(this.scrollPosition);
  }

  constructor(
    dragbar: DragbarService,
    readonly layout: LayoutService,
    private readonly keyconfig: KeyConfigService
  ) {
    this.scrollPosition = this.boundScrollPosition(
      -keyconfig.initScrollPosition * layout.whiteKeyWidth
    );
    dragbar.scroll.subscribe((delta) => {
      this.onDragbarScroll(delta);
    });
    dragbar.scrollActive.subscribe((active) => {
      this.scrollActive = active;
    });
  }

  private calcViewBox(): Array<number> {
    return [
      0, 0,
      this.numVisibleKeys_ * this.layout.whiteKeyWidth + this.layout.keyStrokeWidth,
      this.layout.whiteKeyHeight + (this.layout.dragBarHeight + this.layout.keyBoardPadding) * 2 + this.layout.dragBarStrokeWidth
    ];
  }

  private boundScrollPosition(position: number): number {
    return Math.max(
      Math.min(0, position),
      -(this.keyconfig.numWhiteKeys - this.numVisibleKeys_) * this.layout.whiteKeyWidth + this.layout.keyStrokeWidth
    );
  }

  private onDragbarScroll(delta: number): void {
    const newScrollPosition = this.scrollPosition + delta * KeyboardComponent.scrollAmplifier;
    this.scrollPosition = this.boundScrollPosition(newScrollPosition);
  }
}
