// Path: src/app/components/body/variables/sidebar/sidebar-button/sidebar-button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarButtonComponent } from './sidebar-button.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { globalInitialState } from '../../../../../new.state/xml/xml.interface';

describe('DefaultSidebarButtonComponent', () => {
  let component: SidebarButtonComponent;
  let fixture: ComponentFixture<SidebarButtonComponent>;
  let store: MockStore;
  const initialState = globalInitialState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarButtonComponent],
      providers: [provideMockStore({ initialState })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupID', 'ALL');
    fixture.componentRef.setInput('label', '');
    fixture.componentRef.setInput('selected', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
