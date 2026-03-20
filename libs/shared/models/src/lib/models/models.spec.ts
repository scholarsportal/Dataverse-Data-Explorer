import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Models } from './models';

describe('Models', () => {
  let component: Models;
  let fixture: ComponentFixture<Models>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Models],
    }).compileComponents();

    fixture = TestBed.createComponent(Models);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
