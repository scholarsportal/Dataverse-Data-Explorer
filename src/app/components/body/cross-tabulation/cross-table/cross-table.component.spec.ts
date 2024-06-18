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
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('cols', []);
    fixture.componentRef.setInput('hasData', false);
    fixture.componentRef.setInput('exportClicked', () => void {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
