import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableNavComponent } from './table-nav.component';

describe('TableNavComponent', () => {
  let component: TableNavComponent;
  let fixture: ComponentFixture<TableNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
