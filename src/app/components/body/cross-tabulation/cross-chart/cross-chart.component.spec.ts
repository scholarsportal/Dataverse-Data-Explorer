// Path: src/app/components/body/cross-tabulation/cross-chart/cross-chart.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossChartComponent } from './cross-chart.component';

describe('CrossChartComponent', () => {
  let component: CrossChartComponent;
  let fixture: ComponentFixture<CrossChartComponent>;
  const value = {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrossChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', value);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('cols', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when theme is light', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        return key === 'theme' ? 'light' : null;
      });

      fixture.detectChanges(); // trigger change detection
    });

    it('should handle light theme correctly', () => {
      // Add assertions or checks specific to light theme
      expect(component).toBeTruthy();
      // For example, check some class or property related to the theme
      // expect(component.someProperty).toBe(someExpectedValue);
    });
  });

  describe('when theme is dark', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        return key === 'theme' ? 'dark' : null;
      });

      fixture.detectChanges(); // trigger change detection
    });

    it('should handle dark theme correctly', () => {
      // Add assertions or checks specific to dark theme
      expect(component).toBeTruthy();
      // For example, check some class or property related to the theme
      // expect(component.someProperty).toBe(someExpectedValue);
    });
  });
});
