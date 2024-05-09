import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';
import { SummaryStatistics, variableFormInit } from 'src/app/new.state/ui/ui.interface';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let store: MockStore;
  const initialState = globalInitialState;
  const formInit = variableFormInit;
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
      imports: [ChartComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variableID', '');
    fixture.componentRef.setInput('chart', []);
    fixture.componentRef.setInput('chartTable', {});
    fixture.componentRef.setInput('categoriesInvalid', []);
    fixture.componentRef.setInput('form', formInit);
    fixture.componentRef.setInput('sumStat', sumStatInit);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
