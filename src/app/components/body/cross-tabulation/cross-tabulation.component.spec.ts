import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrossTabulationComponent } from './cross-tabulation.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  globalInitialState,
  Variable,
} from '../../../new.state/xml/xml.interface';
import { selectDatasetProcessedVariables } from '../../../new.state/xml/xml.selectors';
import { selectSelectedWeightVariable } from '../../../new.state/ui/ui.selectors';
import {
  makeVariable,
  withoutVariableLabel,
} from '../../../new.state/xml/variable.mock';

describe('CrossTabulationComponent', () => {
  let component: CrossTabulationComponent;
  let fixture: ComponentFixture<CrossTabulationComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossTabulationComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CrossTabulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Constructs the class without rendering: the full template pulls in child
// components whose selectors the mock initial state cannot satisfy.
describe('CrossTabulationComponent getSelectedWeightVariableToString (issue #208)', () => {
  let store: MockStore;
  let component: CrossTabulationComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState: globalInitialState })],
    });
    store = TestBed.inject(MockStore);
  });

  function selectWeight(variable: Variable): void {
    store.overrideSelector(selectDatasetProcessedVariables, {
      [variable['@_ID']]: variable,
    });
    store.overrideSelector(selectSelectedWeightVariable, variable['@_ID']);
    component = TestBed.runInInjectionContext(
      () => new CrossTabulationComponent(),
    );
  }

  it('returns the weight variable label', () => {
    selectWeight(makeVariable('w1', 'WEIGHT', []));
    expect(component.getSelectedWeightVariableToString()).toBe('WEIGHT label');
  });

  it('falls back to the variable name when there is no <labl>', () => {
    selectWeight(withoutVariableLabel(makeVariable('w1', 'WEIGHT', [])));
    expect(component.getSelectedWeightVariableToString()).toBe('WEIGHT');
  });
});
