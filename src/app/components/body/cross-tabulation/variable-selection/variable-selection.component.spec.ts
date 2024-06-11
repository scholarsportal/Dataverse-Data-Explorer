import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableSelectionComponent } from './variable-selection.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../new.state/xml/xml.interface';

describe('VariableSelectionSectionComponent', () => {
  let component: VariableSelectionComponent;
  let fixture: ComponentFixture<VariableSelectionComponent>;
  let store: MockStore;
  const initialState = globalInitialState;
  [provideMockStore({ initialState })];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableSelectionComponent],
      providers: [provideMockStore({ initialState })]
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
