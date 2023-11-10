import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VarGroupComponent } from './var-group.component';

describe('VarGroupComponent', () => {
  let component: VarGroupComponent;
  let fixture: ComponentFixture<VarGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VarGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VarGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
