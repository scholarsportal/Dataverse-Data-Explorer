import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PivotTable } from './pivot-table';

describe('PivotTable', () => {
  let component: PivotTable;
  let fixture: ComponentFixture<PivotTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PivotTable],
    }).compileComponents();

    fixture = TestBed.createComponent(PivotTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
