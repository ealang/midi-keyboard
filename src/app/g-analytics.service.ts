import { Injectable } from '@angular/core';

@Injectable()
export class GoogleAnalyticsService {
  sendPageView(): void {
    window['ga']('send', 'pageview');
  }
}
