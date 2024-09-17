import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [provideMockStore({ initialState })]

    });
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hasApiKey', true);
    fixture.componentRef.setInput('variables', []);
    fixture.componentRef.setInput('openVariable', '');
    fixture.componentRef.setInput('allVariables', []);
    fixture.componentRef.setInput('groups', []);
    fixture.componentRef.setInput('weights', []);
    fixture.componentRef.setInput('selectedVariables', []);
    fixture.componentRef.setInput('categoriesInvalid', []);
    fixture.componentRef.setInput('variablesWithCrossTabMetadata', []);
    fixture.componentRef.setInput('groupChanged', 'ALL');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
