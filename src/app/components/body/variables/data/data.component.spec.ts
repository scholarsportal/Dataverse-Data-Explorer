import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataComponent } from './data.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../new.state/xml/xml.interface';

// @ts-ignore
describe('DataComponent', () => {
  let component: DataComponent;
  let fixture: ComponentFixture<DataComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  // @ts-ignore
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DataComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variables', {});
    fixture.componentRef.setInput('openVariable', '');
    fixture.componentRef.setInput('selectedVariables', []);
    fixture.componentRef.setInput('categoriesInvalid', []);
    fixture.componentRef.setInput('groupChanged', 'ALL');
    fixture.detectChanges();
  });

  // @ts-ignore
  it('should create', () => {
    // @ts-ignore
    expect(component).toBeTruthy();
  });
});
