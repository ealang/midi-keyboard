import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { DragbarComponent } from './dragbar/dragbar.component';
import { KeyboardComponent } from './keyboard.component';
import { KeysComponent } from './keys/keys.component';

import { TouchModule } from '../touch/touch.module';
import { TouchService } from '../touch/touch.service';
import { LayoutService } from './layout/layout.service';

@NgModule({
  imports: [
    CommonModule,
    TouchModule
  ],
  declarations: [
    DragbarComponent,
    KeyboardComponent,
    KeysComponent
  ],
  providers: [
    LayoutService,
    TouchService
  ],
  exports: [
    KeyboardComponent
  ]
})
export class KeyboardModule { }
