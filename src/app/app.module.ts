import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyboardModule } from './keyboard/keyboard.module';
import { ControlsModule } from './controls/controls.module';

import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    KeyboardModule,
    ControlsModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    KeyConfigService,
    WebMidiService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
