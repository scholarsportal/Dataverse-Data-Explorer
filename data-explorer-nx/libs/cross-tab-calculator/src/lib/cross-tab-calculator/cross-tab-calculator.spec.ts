import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrossTabCalculator } from './cross-tab-calculator';

describe('CrossTabCalculator', () => {
  let component: CrossTabCalculator;
  let fixture: ComponentFixture<CrossTabCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossTabCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(CrossTabCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
