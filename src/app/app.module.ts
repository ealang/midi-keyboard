import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { KeyboardModule } from './keyboard/keyboard.module';

import { NgModel } from '@angular/forms';
import { AppComponent } from './app.component';
import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';

@NgModule({
  declarations: [
    AppComponent,
    NgModel,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    KeyboardModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatSliderModule
  ],
  providers: [
    KeyConfigService,
    WebMidiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
