import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { TouchDirective } from './touch/touch.directive';
import { DragbarComponent } from './dragbar/dragbar.component';
import { KeyboardComponent } from './keyboard.component';
import { LayoutService } from './layout/layout.service';
import { KeysComponent } from './keys/keys.component';

@NgModule({
  declarations: [
    TouchDirective,
    DragbarComponent,
    KeyboardComponent,
    KeysComponent
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
