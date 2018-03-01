import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { TouchDirective } from './touch/touch.directive';
import { DragbarComponent } from './dragbar/dragbar.component';
import { KeyboardComponent } from './keyboard.component';
import { LayoutService } from './layout/layout.service';

@NgModule({
  declarations: [
    TouchDirective,
    DragbarComponent,
    KeyboardComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    LayoutService,
  ],
  exports: [
    KeyboardComponent
  ]
})
export class KeyboardModule { }
