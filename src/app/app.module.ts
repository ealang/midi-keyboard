import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';

import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';
import { LayoutService } from './keyboard/layout/layout.service';

import { NgModel } from '@angular/forms';
import { TouchDirective } from './touch/touch.directive';
import { DragbarComponent } from './keyboard/dragbar/dragbar.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    TouchDirective,
    DragbarComponent,
    KeyboardComponent,
    AppComponent,
    NgModel
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatSliderModule
  ],
  providers: [
    KeyConfigService,
    LayoutService,
    WebMidiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
