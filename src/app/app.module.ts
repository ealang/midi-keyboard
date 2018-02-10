import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { WebMidiService } from './webmidi.service';
import { TouchDirective } from './touch/touch.directive';


@NgModule({
  declarations: [
    AppComponent,
    TouchDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    WebMidiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
