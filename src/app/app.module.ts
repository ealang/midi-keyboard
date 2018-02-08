import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { WebMidiService } from './web-midi.service';


@NgModule({
  declarations: [
    AppComponent
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
