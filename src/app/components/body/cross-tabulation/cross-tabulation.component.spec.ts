import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrossTabulationComponent } from './cross-tabulation.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../new.state/xml/xml.interface';

describe('CrossTabulationComponent', () => {
  let component: CrossTabulationComponent;
  let fixture: ComponentFixture<CrossTabulationComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossTabulationComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CrossTabulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
