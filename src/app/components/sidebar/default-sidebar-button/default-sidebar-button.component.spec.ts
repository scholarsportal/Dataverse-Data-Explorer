import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultSidebarButtonComponent } from './default-sidebar-button.component';

describe('DefaultSidebarButtonComponent', () => {
  let component: DefaultSidebarButtonComponent;
  let fixture: ComponentFixture<DefaultSidebarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultSidebarButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultSidebarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
