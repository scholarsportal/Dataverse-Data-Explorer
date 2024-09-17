import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataComponent } from './data.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../new.state/xml/xml.interface';

describe('DataComponent', () => {
  let component: DataComponent;
  let fixture: ComponentFixture<DataComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DataComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groups', {});
    fixture.componentRef.setInput('variables', {});
    fixture.componentRef.setInput('hasApiKey', true);
    fixture.componentRef.setInput('openVariable', '');
    fixture.componentRef.setInput('selectedVariables', []);
    fixture.componentRef.setInput('categoriesInvalid', []);
    fixture.componentRef.setInput('variablesWithCrossTabMetadata', []);
    fixture.componentRef.setInput('variablesInCrossTabSelection', []);
    fixture.componentRef.setInput('isFetching', false);
    fixture.componentRef.setInput('crossTabValuesFetched', []);
    fixture.componentRef.setInput('weights', []);
    fixture.componentRef.setInput('groupChanged', 'ALL');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
