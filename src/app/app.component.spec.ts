import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WebMidiService } from './webmidi.service';
import { KeyboardComponent } from './keyboard/keyboard.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KeyboardComponent,
        AppComponent
      ],
      providers: [
        WebMidiService,
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
