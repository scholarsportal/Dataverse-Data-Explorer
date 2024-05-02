import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileViewComponent } from './mobile-view.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../../new.state/xml/xml.interface';

describe('MobileViewComponent', () => {
  let component: MobileViewComponent;
  let fixture: ComponentFixture<MobileViewComponent>;
  let store: MockStore;
  const initialState = globalInitialState;
  [provideMockStore({ initialState })];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileViewComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MobileViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variables', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
