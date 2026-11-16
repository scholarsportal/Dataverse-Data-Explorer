import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CrossChartComponent } from './cross-chart.component';
import { ThemeService } from 'src/app/services/theme.service';

describe('CrossChartComponent', () => {
  let component: CrossChartComponent;
  let fixture: ComponentFixture<CrossChartComponent>;
  const value = {
    labels: ['1 person', '2 people'],
    datasets: [
      { label: 'Female', data: [1, 2] },
      { label: 'Male', data: [3, 2] },
    ],
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
    fixture = TestBed.createComponent(CrossChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', value);
    fixture.componentRef.setInput('rows', ['HHLDSIZE - Household size']);
    fixture.componentRef.setInput('cols', ['GENDER - Gender of person']);
    fixture.detectChanges();
  }

  // Every piece of text and every gridline the chart draws.
  function colours(): { text: string[]; grid: string[] } {
    const { scales, plugins } = component.chartJS.options;
    return {
      text: [
        scales.x.ticks.color,
        scales.y.ticks.color,
        scales.y.title.color,
        plugins.title.color,
        plugins.legend.labels.color,
      ],
      grid: [scales.x.grid.color, scales.y.grid.color],
    };
  }

  const onLightPage = {
    text: ['black', 'black', 'black', 'black', 'black'],
    grid: ['#c8c5d0', '#c8c5d0'],
  };
  const onDarkPage = {
    text: ['white', 'white', 'white', 'white', 'white'],
    grid: ['white', 'white'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossChartComponent, TranslateModule.forRoot()],
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

  describe('chart colours (issues #137, #157)', () => {
    it('draws dark text on a light page', () => {
      visitorHas('light');
      create();
      expect(colours()).toEqual(onLightPage);
    });

    it('draws light text on a dark page', () => {
      visitorHas('dark');
      create();
      expect(colours()).toEqual(onDarkPage);
    });

    it('draws dark text when no theme has been stored yet', () => {
      visitorHas(null);
      create();
      expect(colours()).toEqual(onLightPage);
    });

    it('draws dark text when the stored theme is not one this app knows', () => {
      visitorHas('some-other-app-theme');
      create();
      expect(colours()).toEqual(onLightPage);
    });

    it('follows the operating system when no theme has been stored', () => {
      visitorHas(null, true);
      create();
      expect(colours()).toEqual(onDarkPage);
    });

    it('recolours when the theme is switched while the chart is open', () => {
      visitorHas('light');
      create();
      TestBed.inject(ThemeService).toggle();
      fixture.detectChanges();
      expect(colours()).toEqual(onDarkPage);
    });
  });
});
