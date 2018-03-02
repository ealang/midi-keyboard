import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KeyConfigService } from '../keyconfig.service';
import { KeyboardModule } from './keyboard.module';
import { KeyboardComponent } from './keyboard.component';
import { KeyEvent } from './keys/keys.component';

describe('KeyboardComponent', () => {
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;
  const getTranslation = () => {
    const xformRe = new RegExp('translate\\((.*?)\\)'),
          keyboard = fixture.debugElement.query(By.css('g.keys'));
    return Number(xformRe.exec(keyboard.attributes.transform)[1]);
  };
  const getVBox = () => {
    const vb = fixture.debugElement.query(By.css('svg')).attributes.viewBox;
    const [x, y, w, h] = vb.split(',').map((i) => Number(i));
    return {x, y, w, h};
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        KeyboardModule
      ],
      providers: [
        KeyConfigService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    component.scrollPosition = 0;
    component.numVisibleKeys = 7;
    fixture.detectChanges();

  });

  it('should render all 88 keys', () => {
    const allKeys = fixture.debugElement.queryAll(By.css('rect.key'));
    expect(allKeys.length).toEqual(88);
  });

  it('should change the viewbox when zooming out', () => {
    const vb1 = getVBox();
    component.numVisibleKeys = 8;
    fixture.detectChanges();

    const vb2 = getVBox();
    expect(vb1.x).toEqual(vb2.x);
    expect(vb1.y).toEqual(vb2.y);
    expect(vb1.w).toBeLessThan(vb2.w);
    expect(vb1.h).toEqual(vb2.h);
  });

  it('should scroll keyboard when dragbar is scrolled', () => {
    const keyboard = fixture.debugElement.query(By.css('g'));
    const translate1 = getTranslation();
    component.onDragbarScroll(-100);
    fixture.detectChanges();
    const translate2 = getTranslation();

    expect(translate1).toBeGreaterThan(translate2);
  });
});
