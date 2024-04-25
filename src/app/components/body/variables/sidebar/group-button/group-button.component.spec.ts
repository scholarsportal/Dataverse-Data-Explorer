import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupButtonComponent } from './group-button.component';

describe('NewGroupComponent', () => {
  let component: GroupButtonComponent;
  let fixture: ComponentFixture<GroupButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GroupButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
