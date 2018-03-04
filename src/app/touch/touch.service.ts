import { Injectable } from '@angular/core';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type ElemId = string;
export type TouchId = string;

export class TouchEvent {
  constructor(
    readonly eventType: string,
    readonly touchId: TouchId,
    readonly elemId: ElemId,
    readonly coordinates: Point
  ) {
  }
}

type Subscriber = (event: TouchEvent) => void;

@Injectable()
export class TouchService {
  private readonly origin = new OriginPublisher();
  private readonly sticky = new StickyPublisher();

  static stripData(elemId: ElemId): ElemId {
    return elemId && elemId.split(':')[0];
  }

  static elemsAreEqual(elem1: ElemId, elem2: ElemId): boolean {
    return TouchService.stripData(elem1) === TouchService.stripData(elem2);
  }

  /* Subscribe to touches which strictly originate on the given element.
   */
  subscribeOrigin(elemId: ElemId, subscriber: Subscriber): void {
    this.origin.subscribe(elemId, subscriber);
  }

  /* Subscribe to touches which originate or cross through the given element.
   */
  subscribeSticky(elemId: ElemId, subscriber: Subscriber): void {
    this.sticky.subscribe(elemId, subscriber);
  }

  emitEvent(eventType: string, touchId: TouchId, elemId: ElemId, coordinates: Point): void {
    this.origin.emitEvent(eventType, touchId, elemId, coordinates);
    this.sticky.emitEvent(eventType, touchId, elemId, coordinates);
  }
}

export class OriginPublisher {
  private origins = new Map<TouchId, ElemId>();
  private subscribers = new Map<ElemId, Array<Subscriber>>();

  subscribe(elemId: ElemId, subscriber: Subscriber): void {
    const oldSubs = this.subscribers.get(elemId) || [];
    this.subscribers.set(elemId, [...oldSubs, subscriber]);
  }

  emitEvent(eventType: string, touchId: TouchId, curElemId: ElemId, coordinates: Point): void {
    if (eventType === 'start') {
      this.origins.set(touchId, TouchService.stripData(curElemId));
    }
    const originElemId = this.origins.get(touchId);

    if (this.subscribers.has(originElemId)) {
      const event = new TouchEvent(
        eventType,
        touchId,
        TouchService.elemsAreEqual(originElemId, curElemId) ? curElemId : null,
        coordinates
      );
      this.subscribers.get(originElemId).forEach((subscriber) => {
        subscriber(event);
      });
    }

    if (eventType === 'end') {
      this.origins.delete(touchId);
    }
  }
}

export class StickyPublisher {
  private capturedElem = new Map<TouchId, ElemId>();
  private subscribers = new Map<ElemId, Array<Subscriber>>();

  subscribe(elemId: ElemId, subscriber: Subscriber): void {
    const oldSubs = this.subscribers.get(elemId) || [];
    this.subscribers.set(elemId, [...oldSubs, subscriber]);
  }

  emitEvent(eventType: string, touchId: TouchId, curElemId: ElemId, coordinates: Point): void {
    let isFirstCapture = false;
    if (!this.capturedElem.has(touchId) && this.subscribers.has(TouchService.stripData(curElemId))) {
      isFirstCapture = true;
      this.capturedElem.set(touchId, TouchService.stripData(curElemId));
    }

    const capturedElemId = this.capturedElem.get(touchId) || null;
    if (capturedElemId !== null) {
      const event = new TouchEvent(
        isFirstCapture ? 'start' : eventType,
        touchId,
        TouchService.elemsAreEqual(capturedElemId, curElemId) ? curElemId : null,
        coordinates
      );
      this.subscribers.get(capturedElemId).forEach((subscriber) => {
        subscriber(event);
      });
    }

    if (eventType === 'end') {
      this.capturedElem.delete(touchId);
    }
  }
}
