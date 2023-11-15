import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectDropdownComponent } from './multiselect-dropdown.component';

describe('MultiselectDropdownComponent', () => {
  let component: MultiselectDropdownComponent;
  let fixture: ComponentFixture<MultiselectDropdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultiselectDropdownComponent]
    });
    fixture = TestBed.createComponent(MultiselectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
