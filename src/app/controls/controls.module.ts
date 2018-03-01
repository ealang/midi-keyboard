import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ControlsComponent } from './controls.component';

@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatSliderModule
  ],
  declarations: [
    NgModel,
    ControlsComponent
  ],
  exports: [
    ControlsComponent
  ]
})
export class ControlsModule { }
