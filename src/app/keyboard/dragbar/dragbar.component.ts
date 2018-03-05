import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { DragbarService } from './dragbar.service';

@Component({
  // tslint:disable-next-line:component-selector (need component to be valid svg)
  selector: '[app-dragbar]',
  templateUrl: './dragbar.component.html',
  styleUrls: ['./dragbar.component.css']
})
export class DragbarComponent {
  readonly touchElemId: string;
  selected = false;

  @Input() width: number;
  @Input() height: number;
  @Input() strokeWidth: number;

  constructor(service: DragbarService) {
    this.touchElemId = service.touchElemId;
    service.scrollActive.subscribe((active: boolean) => this.selected = active);
  }
}
