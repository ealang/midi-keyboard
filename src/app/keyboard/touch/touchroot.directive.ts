import { Directive, HostListener, ElementRef } from '@angular/core';

import { TouchService } from './touch.service';
import { Point } from '../../geometry';

@Directive({
  selector: 'svg[appTouchRoot]'
})
export class TouchRootDirective {
  private static mouseId = 'mouse';
  private root: Element;
  private mouseActive = false;
  private ownedTouchIds = new Set<number>();

  constructor(root: ElementRef, private touch: TouchService) {
    this.root = root.nativeElement;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStartEvent(event: TouchEvent): void {
    Array.from(event.targetTouches).forEach((touch) => {
      this.ownedTouchIds.add(touch.identifier);
    });
    this.onTouchEvent('start', event);
  }

  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  onTouchEndEvent(event: TouchEvent): void {
    this.onTouchEvent('end', event);
    Array.from(event.changedTouches).forEach((touch) => {
      this.ownedTouchIds.delete(touch.identifier);
    });
  }

  @HostListener('touchmove', ['"move"', '$event'])
  onTouchEvent(eventType: string, event: TouchEvent): void {
    Array.from(event.changedTouches)
         .filter((touch) => this.ownedTouchIds.has(touch.identifier))
         .forEach((touch) => {
            const elem = this.elementFromPoint(touch.clientX, touch.clientY);
            this.touch.emitEvent(
              eventType,
              `touch${touch.identifier}`,
              elem && this.touchNameFromPoint(elem),
              elem && this.toElemRelativeCoordinates(elem, touch.clientX, touch.clientY),
              this.toSVGCoordinates(touch.clientX, touch.clientY)
            );
         });
    event.preventDefault();
  }

  @HostListener('mousedown', ['"start"', '$event'])
  @HostListener('mousemove', ['"move"', '$event'])
  @HostListener('mouseup', ['"end"', '$event'])
  @HostListener('mouseleave', ['"end"', '$event'])
  onMouseEvent(eventType: string, event: MouseEvent): void {
    if (eventType === 'start' || this.mouseActive) {
      const elem = this.elementFromPoint(event.clientX, event.clientY);
      this.touch.emitEvent(
        eventType,
        TouchRootDirective.mouseId,
        elem && this.touchNameFromPoint(elem),
        elem && this.toElemRelativeCoordinates(elem, event.clientX, event.clientY),
        this.toSVGCoordinates(event.clientX, event.clientY)
      );
    }
    if (eventType === 'start') {
      this.mouseActive = true;
    } else if (eventType === 'end') {
      this.mouseActive = false;
    }
    event.preventDefault();
  }

  private elementFromPoint(clientX: number, clientY: number): Element {
    const element = document.elementFromPoint(clientX, clientY);
    if (element && this.root.contains(element)) {
      return element;
    } else {
      return null;
    }
  }

  private svgPoint(x: number, y: number): SVGPoint {
    const pt = (this.root as SVGSVGElement).createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt;
  }

  private toSVGCoordinates(clientX: number, clientY: number): Point {
    const screenToSVG = (this.root as SVGGraphicsElement).getScreenCTM().inverse();
    return this.svgPoint(clientX, clientY).matrixTransform(screenToSVG);
  }

  private toElemRelativeCoordinates(element: Element, clientX: number, clientY: number): Point {
    const transform = (element as SVGGraphicsElement).getScreenCTM().inverse(),
          bbox = (element as SVGGraphicsElement).getBBox(),
          svgPt = this.svgPoint(clientX, clientY).matrixTransform(transform);
    return {x: (svgPt.x - bbox.x) / bbox.width, y: (svgPt.y - bbox.y) / bbox.height};
  }

  private touchNameFromPoint(element: Element): string {
    if (element.hasAttribute('data-touch-id')) {
      return element.getAttribute('data-touch-id');
    } else {
      return null;
    }
  }
}
