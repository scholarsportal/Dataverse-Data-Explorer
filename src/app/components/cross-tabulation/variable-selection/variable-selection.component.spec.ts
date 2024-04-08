import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableSelectionComponent } from './variable-selection.component';

describe('VariableSelectionSectionComponent', () => {
  let component: VariableSelectionComponent;
  let fixture: ComponentFixture<VariableSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableSelectionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VariableSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
