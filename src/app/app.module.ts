import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { WebMidiService } from './webmidi.service';

import { AppComponent } from './app.component';
import { KeyboardComponent } from './keyboard/keyboard.component';

import { TouchDirective } from './touch/touch.directive';

@NgModule({
  declarations: [
    TouchDirective,
    KeyboardComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDividerModule,
    MatSelectModule,
    MatButtonModule
  ],
  providers: [
    WebMidiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
