import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../new.state/xml/xml.interface';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('variables', []);
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
});
