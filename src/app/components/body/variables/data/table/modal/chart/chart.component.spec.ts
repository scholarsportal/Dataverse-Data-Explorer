import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ChartComponent } from './chart.component';
import { ThemeService } from 'src/app/services/theme.service';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';
import {
  SummaryStatistics,
  variableFormInit,
} from 'src/app/new.state/ui/ui.interface';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  const sumStatInit: SummaryStatistics = {
    mode: 'sum',
    mean: '',
    minimum: '',
    maximum: '',
    median: '',
    standardDeviation: '',
    totalValidCount: '',
    totalInvalidCount: '',
  };

  // What the visitor's browser holds: the stored theme preference (if any)
  // and whether the operating system asks for dark mode.
  function visitorHas(storedTheme: string | null, systemDark = false): void {
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) =>
      key === 'theme' ? storedTheme : null,
    );
    spyOn(Storage.prototype, 'setItem');
    spyOn(window, 'matchMedia').and.returnValue({
      matches: systemDark,
    } as MediaQueryList);
  }

  function create(): void {
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variableID', 'v1');
    fixture.componentRef.setInput('variableLabel', 'Province');
    fixture.componentRef.setInput('hasCategories', true);
    fixture.componentRef.setInput('weights', {});
    fixture.componentRef.setInput('chart', [
      { x: 3, y: 'Ontario' },
      { x: 5, y: 'Quebec' },
    ]);
    fixture.componentRef.setInput('chartReference', ['Ontario', 'Quebec']);
    fixture.componentRef.setInput('chartTable', {});
    fixture.componentRef.setInput('categoriesInvalid', []);
    fixture.componentRef.setInput('groups', []);
    fixture.componentRef.setInput('form', variableFormInit);
    fixture.componentRef.setInput('sumStat', sumStatInit);
    fixture.detectChanges();
  }

  function axisColours(): { ticks: string[]; grid: string[] } {
    const { x, y } = component.chartJS.options.scales;
    return {
      ticks: [x.ticks.color, y.ticks.color],
      grid: [x.grid.color, y.grid.color],
    };
  }

  const onLightPage = { ticks: ['black', 'black'], grid: ['#c8c5d0', '#c8c5d0'] };
  const onDarkPage = { ticks: ['white', 'white'], grid: ['white', 'white'] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent, TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState: globalInitialState })],
    }).compileComponents();
  });

  afterEach(() => {
    component?.chartJS?.destroy();
    document.body.removeAttribute('data-theme');
  });

  it('should create', () => {
    visitorHas('light');
    create();
    expect(component).toBeTruthy();
  });

  describe('axis colours (issues #137, #157)', () => {
    it('draws dark axis labels on a light page', () => {
      visitorHas('light');
      create();
      expect(axisColours()).toEqual(onLightPage);
    });

    it('draws light axis labels on a dark page', () => {
      visitorHas('dark');
      create();
      expect(axisColours()).toEqual(onDarkPage);
    });

    it('draws dark axis labels when no theme has been stored yet', () => {
      // White labels on the default light page were invisible.
      visitorHas(null);
      create();
      expect(axisColours()).toEqual(onLightPage);
    });

    it('draws dark axis labels when the stored theme is not one this app knows', () => {
      visitorHas('some-other-app-theme');
      create();
      expect(axisColours()).toEqual(onLightPage);
    });

    it('follows the operating system when no theme has been stored', () => {
      visitorHas(null, true);
      create();
      expect(axisColours()).toEqual(onDarkPage);
    });

    it('recolours when the theme is switched while the chart is open', () => {
      visitorHas('light');
      create();
      TestBed.inject(ThemeService).toggle();
      fixture.detectChanges();
      expect(axisColours()).toEqual(onDarkPage);
    });
  });
});
