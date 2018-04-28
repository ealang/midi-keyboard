import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';

import { KeyboardModule } from './keyboard/keyboard.module';
import { ControlsModule } from './controls/controls.module';
import { KeypressModule } from './keypress/keypress.module';

import { ControlsService } from './controls/controls.service';
import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';
import { PlayService } from './play/play.service';
import { GoogleAnalyticsService } from './g-analytics.service';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    KeypressModule,
    KeyboardModule,
    ControlsModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    KeyConfigService,
    WebMidiService,
    ControlsService,
    PlayService,
    GoogleAnalyticsService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
