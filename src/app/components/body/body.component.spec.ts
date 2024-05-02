import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyComponent } from './body.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../new.state/xml/xml.interface';

describe('BodyComponent', () => {
  let component: BodyComponent;
  let fixture: ComponentFixture<BodyComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
