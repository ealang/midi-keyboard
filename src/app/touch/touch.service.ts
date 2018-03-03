import { Injectable } from '@angular/core';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export class TouchEvent {
  constructor(
    readonly eventType: string,
    readonly touchId: string,
    readonly elemId: string,
    readonly coordinates: Point
  ) {
  }
}

type Subscriber = (event: TouchEvent) => void;

@Injectable()
export class TouchService {
  private originElemIdForTouch = new Map<string, string>();     // touch id -> elem id
  private subscribers = new Map<string, Array<Subscriber>>();   // elem name -> subs

  private static allMatchingIds(elemId: string): Array<string> {
    const ids = [];
    if (elemId !== null) {
      const parts = elemId.split('/');
      for (let i = 1; i <= parts.length; i++) {
        ids.push(parts.slice(0, i).join('/'));
      }
    }
    return ids;
  }

  private static subscriptionContains(subscription: string, id: string): boolean {
    return (id + '/').startsWith(subscription + '/');
  }

  private forSubscribersTo(elemId: string, handler: (subscriber: Subscriber, subscription: string) => void) {
    TouchService.allMatchingIds(elemId).forEach((subscription) => {
      if (this.subscribers.has(subscription)) {
        this.subscribers.get(subscription).forEach((subscriber) => {
          handler(subscriber, subscription);
        });
      }
    });
  }

  emitEvent(eventType: string, touchId: string, elemId: string, coordinates: Point): void {
    if (eventType === 'start') {
      this.originElemIdForTouch.set(touchId, elemId);
    }
    const originElemId = this.originElemIdForTouch.get(touchId);

    this.forSubscribersTo(originElemId, (subscriber, subscription) => {
      const event = new TouchEvent(
        eventType,
        touchId,
        TouchService.subscriptionContains(subscription, elemId) ?
          elemId : null,
        coordinates
      );
      subscriber(event);
    });

    if (eventType === 'end') {
      this.originElemIdForTouch.delete(touchId);
    }
  }

  subscribe(elemName: string, callback: Subscriber): void {
    if (this.subscribers.has(elemName)) {
      this.subscribers.get(elemName).push(callback);
    } else {
      this.subscribers.set(elemName, [callback]);
    }
  }
}
