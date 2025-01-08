// Path: src/app/components/body/variables/data/table-menu/table-menu.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMenuComponent } from './table-menu.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../../new.state/xml/xml.interface';

describe('TableMenuComponent', () => {
  let component: TableMenuComponent;
  let fixture: ComponentFixture<TableMenuComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableMenuComponent],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(TableMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedVariables', []);
    fixture.componentRef.setInput('groupID', []);
    fixture.componentRef.setInput('weights', {});
    fixture.componentRef.setInput('allGroups', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
