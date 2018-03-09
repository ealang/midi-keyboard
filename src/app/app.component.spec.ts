import { TestBed, async } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyboardModule } from './keyboard/keyboard.module';
import { ControlsModule } from './controls/controls.module';

import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';
import { LayoutService } from './keyboard/layout.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        KeyboardModule,
        ControlsModule
      ],
      declarations: [
        AppComponent,
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
