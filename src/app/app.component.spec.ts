import { TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';

import { KeypressModule } from './keypress/keypress.module';
import { KeyboardModule } from './keyboard/keyboard.module';
import { ControlsModule } from './controls/controls.module';

import { WebMidiService } from './webmidi.service';
import { KeyConfigService } from './keyconfig.service';
import { LayoutService } from './keyboard/layout.service';
import { ControlsService } from './controls/controls.service';
import { ControlsPersistenceService } from './controls/persistence/controls-persistence.service';
import { LocalStorageService } from './controls/persistence/local-storage.service';
import { PlayService } from './play/play.service';
import { GoogleAnalyticsService } from './g-analytics.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        KeypressModule,
        KeyboardModule,
        ControlsModule,
        MatSidenavModule
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        WebMidiService,
        LayoutService,
        KeyConfigService,
        ControlsService,
        ControlsPersistenceService,
        PlayService,
        {
          provide: LocalStorageService,
          useValue: {
            getItem: () => {},
            setItem: () => {}
          }
        },
        {
          provide: GoogleAnalyticsService,
          useValue: {
            sendPageView: () => {}
          }
        }
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
