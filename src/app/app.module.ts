import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { WebMidiService } from './webmidi.service';

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
