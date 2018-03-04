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
  private readonly originService = new OriginTouchService();
  private readonly roamingService = new RoamingTouchService();

  static stripData(elemId: ElemId): ElemId {
    return elemId && elemId.split(':')[0];
  }

  static elemsAreEqual(elem1: ElemId, elem2: ElemId): boolean {
    return TouchService.stripData(elem1) === TouchService.stripData(elem2);
  }

  /* Subscribe to touches which strictly originate on the given element.
   */
  subscribeOrigin(elemId: ElemId, subscriber: Subscriber): void {
    this.originService.subscribe(elemId, subscriber);
  }

  /* Subscribe to touches which originate or cross through the given element.
   */
  subscribeRoaming(elemId: ElemId, subscriber: Subscriber): void {
    this.roamingService.subscribe(elemId, subscriber);
  }

  emitEvent(eventType: string, touchId: TouchId, elemId: ElemId, coordinates: Point): void {
    this.originService.emitEvent(eventType, touchId, elemId, coordinates);
    this.roamingService.emitEvent(eventType, touchId, elemId, coordinates);
  }
}

class OriginTouchService {
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

class RoamingTouchService {
  private lastElem = new Map<TouchId, ElemId>();
  private subscribers = new Map<ElemId, Array<Subscriber>>();

  subscribe(elemId: ElemId, subscriber: Subscriber): void {
    const oldSubs = this.subscribers.get(elemId) || [];
    this.subscribers.set(elemId, [...oldSubs, subscriber]);
  }

  private publishVirtualEvents(events: Array<[ElemId, string]>, curElemId: ElemId, touchId: TouchId, coordinates: Point): void {
    for (const [subElemId, eventType] of events) {
      if (this.subscribers.has(subElemId)) {
        const event = new TouchEvent(
          eventType,
          touchId,
          TouchService.elemsAreEqual(subElemId, curElemId) ? subElemId : null,
          coordinates
        );
        this.subscribers.get(subElemId).forEach((subscriber) => {
          subscriber(event);
        });
      }
    }
  }

  emitEvent(eventType: string, touchId: TouchId, curElemId: ElemId, coordinates: Point): void {
    const lastElemId = this.lastElem.get(touchId) || null;

    if (eventType === 'end') {
      this.lastElem.delete(touchId);
    } else if (curElemId !== null) {
      this.lastElem.set(touchId, curElemId);
    }

    const virtualEvents = new Array<[ElemId, string]>();
    if (eventType === 'start') {
      virtualEvents.push([curElemId, 'start']);
    } else if (eventType === 'move') {
      if (curElemId !== null && !TouchService.elemsAreEqual(lastElemId, curElemId)) {
        virtualEvents.push([lastElemId, 'end']);
        virtualEvents.push([curElemId, 'start']);
      } else {
        virtualEvents.push([lastElemId, 'move']);
      }
    } else if (eventType === 'end') {
      if (lastElemId !== null) {
        virtualEvents.push([lastElemId, 'end']);
      }
    }
    this.publishVirtualEvents(virtualEvents, curElemId, touchId, coordinates);
  }
}
