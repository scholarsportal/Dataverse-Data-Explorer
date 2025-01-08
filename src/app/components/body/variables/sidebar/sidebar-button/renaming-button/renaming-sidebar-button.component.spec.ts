// Path: src/app/components/body/variables/sidebar/sidebar-button/renaming-button/renaming-sidebar-button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenamingSidebarButtonComponent } from './renaming-sidebar-button.component';

describe('RenamingSidebarButtonComponent', () => {
  let component: RenamingSidebarButtonComponent;
  let fixture: ComponentFixture<RenamingSidebarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenamingSidebarButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RenamingSidebarButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
