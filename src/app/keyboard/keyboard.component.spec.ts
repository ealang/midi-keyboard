import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KeyboardModule } from './keyboard.module';
import { KeyboardComponent } from './keyboard.component';
import { DragbarService } from './dragbar/dragbar.service';
import { LayoutService } from './layout.service';
import { TouchService } from './touch/touch.service';
import { KeypressService } from '../keypress/keypress.service';
import { KeyConfigService } from '../keyconfig.service';
import { ControlsService } from '../controls/controls.service';

describe('KeyboardComponent', () => {
  let touch: TouchService;
  let dragbar: DragbarService;
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;
  const getTranslation = () => {
    const xformRe = new RegExp('translate\\((.*?),.*?\\)'),
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
        KeyConfigService,
        KeypressService,
        ControlsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    touch = fixture.debugElement.injector.get(TouchService);
    dragbar = fixture.debugElement.injector.get(DragbarService);
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
    const keyboard = fixture.debugElement.query(By.css('app-dragbar'));
    const translate1 = getTranslation();

    touch.emitEvent(
      'start',
      'mouse',
      dragbar.touchElemId,
      {x: 0, y: 0},
      {x: 100, y: 0}
    );
    touch.emitEvent(
      'move',
      'mouse',
      dragbar.touchElemId,
      {x: 0, y: 0},
      {x: 0, y: 0}
    );

    fixture.detectChanges();
    const translate2 = getTranslation();

    expect(translate1).toBeGreaterThan(translate2);
  });
});
