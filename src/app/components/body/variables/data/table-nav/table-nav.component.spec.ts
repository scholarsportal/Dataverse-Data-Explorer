import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableNavComponent } from './table-nav.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../../new.state/xml/xml.interface';

describe('TableNavComponent', () => {
  let component: TableNavComponent;
  let fixture: ComponentFixture<TableNavComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableNavComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TableNavComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupChanged', 'ALL');
    fixture.componentRef.setInput('variablesList', []);
    fixture.componentRef.setInput('total', 0);
    fixture.componentRef.setInput('itemsPerPage', 10);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.componentRef.setInput('isLastPage', false);
    fixture.componentRef.setInput('isFirstPage', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
