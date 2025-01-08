// Path: src/app/components/body/variables/data/table/modal/modal-footer/modal-footer.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFooterComponent } from './modal-footer.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from 'src/app/new.state/xml/xml.interface';

describe('ModalFooterComponent', () => {
  let component: ModalFooterComponent;
  let fixture: ComponentFixture<ModalFooterComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFooterComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ModalFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
