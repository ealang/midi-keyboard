import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';

@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatSliderModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  declarations: [
    NgModel,
    ToolbarComponent,
    SidenavComponent
  ],
  exports: [
    ToolbarComponent,
    SidenavComponent
  ]
})
export class ControlsModule { }
