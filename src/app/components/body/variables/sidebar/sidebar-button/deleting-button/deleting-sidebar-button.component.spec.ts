import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletingSidebarButtonComponent } from './deleting-sidebar-button.component';

describe('DeletingSidebarButtonComponent', () => {
  let component: DeletingSidebarButtonComponent;
  let fixture: ComponentFixture<DeletingSidebarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletingSidebarButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeletingSidebarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
