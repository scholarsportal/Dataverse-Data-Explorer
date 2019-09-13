import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VarStatDialogComponent } from './var-stat-dialog.component';

describe('VarStatDialogComponent', () => {
  let component: VarStatDialogComponent;
  let fixture: ComponentFixture<VarStatDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VarStatDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VarStatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
