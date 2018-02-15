import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';

import { AppComponent } from './app.component';
import { WebMidiService } from './webmidi.service';
import { TouchDirective } from './touch/touch.directive';
import { KeyboardComponent } from './keyboard/keyboard.component';


@NgModule({
  declarations: [
    TouchDirective,
    KeyboardComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSelectModule
  ],
  providers: [
    WebMidiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
