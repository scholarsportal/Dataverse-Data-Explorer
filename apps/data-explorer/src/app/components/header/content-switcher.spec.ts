import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentSwitcher } from './content-switcher';

describe('ContentSwitcher', () => {
  let component: ContentSwitcher;
  let fixture: ComponentFixture<ContentSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
