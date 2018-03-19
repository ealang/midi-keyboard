import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { TouchService } from './touch/touch.service';
import { DragbarService } from './dragbar/dragbar.service';
import { LayoutService } from './layout.service';
import { KeyConfigService } from '../keyconfig.service';
import { ControlsService } from '../controls/controls.service';

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
  private minikeysValue;
  private numVisibleKeysValue = 0;

  scrollActive = false;
  scrollPosition = 0;
  viewBox: Array<number> = [0, 0, 0, 0];

  @Input() set minikeys(enabled: boolean) {
    this.minikeysValue = enabled;
    this.viewBox = this.calcViewBox();
  }
  get minikeys(): boolean {
    return this.minikeysValue;
  }

  @Input() set numVisibleKeys(num: number) {
    this.numVisibleKeysValue = num;
    this.viewBox = this.calcViewBox();
    this.scrollPosition = this.boundScrollPosition(this.scrollPosition);
  }
  get numVisibleKeys(): number {
    return this.numVisibleKeysValue;
  }

  constructor(
    dragbar: DragbarService,
    readonly layout: LayoutService,
    private readonly keyconfig: KeyConfigService,
    controls: ControlsService
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
    const w = this.numVisibleKeys * this.layout.whiteKeyWidth + this.layout.keyStrokeWidth,
          h = this.layout.whiteKeyHeight(this.minikeys) +
              (this.layout.dragBarHeight + this.layout.keyBoardPadding) * 2 +
              this.layout.dragBarStrokeWidth;
    return [
      0, 0,
      w, h
    ];
  }

  private boundScrollPosition(position: number): number {
    return Math.max(
      Math.min(0, position),
      -(this.keyconfig.numWhiteKeys - this.numVisibleKeys) * this.layout.whiteKeyWidth + this.layout.keyStrokeWidth
    );
  }

  private onDragbarScroll(delta: number): void {
    const newScrollPosition = this.scrollPosition + delta * KeyboardComponent.scrollAmplifier;
    this.scrollPosition = this.boundScrollPosition(newScrollPosition);
  }
}
