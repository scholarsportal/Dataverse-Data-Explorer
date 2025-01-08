// Path: src/app/components/body/variables/data/table/modal/chart/summary-statistics/summary-statistics.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryStatisticsComponent } from './summary-statistics.component';
import { SummaryStatistics } from 'src/app/new.state/ui/ui.interface';

describe('SummaryStatisticsComponent', () => {
  let component: SummaryStatisticsComponent;
  let fixture: ComponentFixture<SummaryStatisticsComponent>;
  const sumStatInit: SummaryStatistics = {
    mode: 'sum',
    mean: '',
    minimum: '',
    maximum: '',
    median: '',
    standardDeviation: '',
    totalValidCount: '',
    totalInvalidCount: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryStatisticsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SummaryStatisticsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('summaryStats', sumStatInit);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
