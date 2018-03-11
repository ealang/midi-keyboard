import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TouchIdDirective } from './touchid.directive';
import { TouchRootDirective } from './touchroot.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TouchIdDirective,
    TouchRootDirective
  ],
  exports: [
    TouchIdDirective,
    TouchRootDirective
  ]
})
export class TouchModule { }
