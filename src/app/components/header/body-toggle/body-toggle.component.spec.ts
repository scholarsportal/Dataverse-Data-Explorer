// Path: src/app/components/header/body-toggle/body-toggle.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyToggleComponent } from './body-toggle.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../new.state/xml/xml.interface';

describe('BodyToggleComponent', () => {
  let component: BodyToggleComponent;
  let fixture: ComponentFixture<BodyToggleComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyToggleComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BodyToggleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('toggleState', 'variables');
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
