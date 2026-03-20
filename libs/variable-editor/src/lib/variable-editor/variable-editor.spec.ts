import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariableEditor } from './variable-editor';

describe('VariableEditor', () => {
  let component: VariableEditor;
  let fixture: ComponentFixture<VariableEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(VariableEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
