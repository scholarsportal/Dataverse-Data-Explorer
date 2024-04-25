import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGroupComponent } from './new-group.component';

describe('NewGroupComponent', () => {
  let component: NewGroupComponent;
  let fixture: ComponentFixture<NewGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
