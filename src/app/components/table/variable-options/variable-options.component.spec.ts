import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableOptionsComponent } from './variable-options.component';

describe('VariableOptionsComponent', () => {
  let component: VariableOptionsComponent;
  let fixture: ComponentFixture<VariableOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariableOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
