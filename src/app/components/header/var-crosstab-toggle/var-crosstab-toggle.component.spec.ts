import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarCrosstabToggleComponent } from './var-crosstab-toggle.component';

describe('VarCrosstabToggleComponent', () => {
  let component: VarCrosstabToggleComponent;
  let fixture: ComponentFixture<VarCrosstabToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarCrosstabToggleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VarCrosstabToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
