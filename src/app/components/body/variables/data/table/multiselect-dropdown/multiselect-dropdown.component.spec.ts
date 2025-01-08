// Path: src/app/components/body/variables/data/table/multiselect-dropdown/multiselect-dropdown.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectDropdownComponent } from './multiselect-dropdown.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';

describe('MultiselectDropdownComponent', () => {
  let component: MultiselectDropdownComponent;
  let fixture: ComponentFixture<MultiselectDropdownComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectDropdownComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MultiselectDropdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('itemList', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
