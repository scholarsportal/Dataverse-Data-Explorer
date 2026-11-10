import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';
import { selectDatasetProcessedVariables } from 'src/app/new.state/xml/xml.selectors';
import {
  makeVariable,
  withoutVariableLabel,
} from 'src/app/new.state/xml/variable.mock';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent, TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('index', 0);
    // fixture.componentRef.setInput('variables', []);
    fixture.componentRef.setInput('groups', []);
    fixture.componentRef.setInput('variableOrientation', 'row');
    fixture.componentRef.setInput('selectedVariableID', '');
    fixture.componentRef.setInput('variablesAlreadySelected', []);
    fixture.componentRef.setInput('categories', {});
    fixture.componentRef.setInput('missing', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists unlabelled variables in a group without throwing (issue #208)', () => {
    store.overrideSelector(selectDatasetProcessedVariables, {
      v1: makeVariable('v1', 'PROV', []),
      v2: withoutVariableLabel(makeVariable('v2', 'pes25_data_quality', [])),
    });
    store.refreshState();
    fixture.componentRef.setInput('groups', {
      g1: { labl: 'Quality', '@_ID': 'g1', '@_var': 'v1 v2' },
    });
    component.selectedGroup.set('g1');

    expect(component.filteredVariables().map((v) => v.label)).toEqual([
      'PROV label',
      'pes25_data_quality - No Label',
    ]);
  });

  it('returns no label for an unlabelled selected variable (issue #208)', () => {
    store.overrideSelector(selectDatasetProcessedVariables, {
      v2: withoutVariableLabel(makeVariable('v2', 'pes25_data_quality', [])),
    });
    store.refreshState();
    fixture.componentRef.setInput('selectedVariableID', 'v2');

    expect(component.selectedVariableLabel()).toBeUndefined();
  });
});
