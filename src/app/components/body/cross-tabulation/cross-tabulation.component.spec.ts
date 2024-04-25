import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrossTabulationComponent } from './cross-tabulation.component';

describe('CrossTabulationComponent', () => {
  let component: CrossTabulationComponent;
  let fixture: ComponentFixture<CrossTabulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossTabulationComponent],
      providers: []
    })
      .compileComponents();

    fixture = TestBed.createComponent(CrossTabulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
