import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableInformationComponent } from './variable-information.component';
import { variableFormInit } from 'src/app/new.state/ui/ui.interface';

describe('VariableInformationComponent', () => {
  let component: VariableInformationComponent;
  let fixture: ComponentFixture<VariableInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableInformationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VariableInformationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', variableFormInit);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
