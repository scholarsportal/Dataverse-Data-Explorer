import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditModalComponent } from './bulk-edit-modal.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';

describe('BulkEditModalComponent', () => {
  let component: BulkEditModalComponent;
  let fixture: ComponentFixture<BulkEditModalComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkEditModalComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BulkEditModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedVariables', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
