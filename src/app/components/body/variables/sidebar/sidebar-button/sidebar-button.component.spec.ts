import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarButtonComponent } from './sidebar-button.component';

describe('DefaultSidebarButtonComponent', () => {
  let component: SidebarButtonComponent;
  let fixture: ComponentFixture<SidebarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
