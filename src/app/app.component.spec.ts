import { TestBed, async } from '@angular/core/testing';

import { WebMidiService } from './webmidi.service';
import { AppComponent } from './app.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { TouchDirective } from './touch/touch.directive';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDividerModule,
        MatSelectModule,
        MatButtonModule
      ],
      declarations: [
        TouchDirective,
        KeyboardComponent,
        AppComponent
      ],
      providers: [
        WebMidiService
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
