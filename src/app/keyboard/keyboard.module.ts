import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TouchModule } from './touch/touch.module';
import { DragbarComponent } from './dragbar/dragbar.component';
import { KeyboardComponent } from './keyboard.component';
import { KeysComponent } from './keys/keys.component';

@NgModule({
  imports: [
    CommonModule,
    TouchModule
  ],
  declarations: [
    DragbarComponent,
    KeysComponent,
    KeyboardComponent
  ],
  exports: [
    KeyboardComponent
  ]
})
export class KeyboardModule { }
