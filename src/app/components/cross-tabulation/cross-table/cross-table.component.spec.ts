import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossTableComponent } from './cross-table.component';

describe('CrossTableComponent', () => {
  let component: CrossTableComponent;
  let fixture: ComponentFixture<CrossTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrossTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
