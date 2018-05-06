import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';

import { KeyboardModule } from './keyboard/keyboard.module';
import { ControlsModule } from './controls/controls.module';
import { KeypressModule } from './keypress/keypress.module';

import { ControlsService } from './controls/controls.service';
import { ControlsPersistenceService } from './controls/persistence/controls-persistence.service';
import { LocalStorageService } from './controls/persistence/local-storage.service';
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
    ControlsPersistenceService,
    LocalStorageService,
    PlayService,
    GoogleAnalyticsService,
    {
      provide: ControlsService,
      useFactory: ControlsPersistenceService.restoreControlsService,
      deps: [LocalStorageService]
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
