import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossChartComponent } from './cross-chart.component';

describe('CrossChartComponent', () => {
  let component: CrossChartComponent;
  let fixture: ComponentFixture<CrossChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrossChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
