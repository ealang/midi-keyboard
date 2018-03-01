import { TestBed, async } from '@angular/core/testing';

import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';
import { LayoutService } from './keyboard/layout/layout.service';

import { NgModel } from '@angular/forms';
import { AppComponent } from './app.component';

import { KeyboardModule } from './keyboard/keyboard.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatSelectModule,
        MatButtonModule,
        MatToolbarModule,
        MatSliderModule,
        KeyboardModule
      ],
      declarations: [
        AppComponent,
        NgModel
      ],
      providers: [
        WebMidiService,
        LayoutService,
        KeyConfigService
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
