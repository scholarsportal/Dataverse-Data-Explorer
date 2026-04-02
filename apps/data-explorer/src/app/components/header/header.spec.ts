import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'test');
    fixture.componentRef.setInput('description', 'test');
    fixture.componentRef.setInput('currentContent', 'cross-tab');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme', () => {
    const initialTheme = document.documentElement.getAttribute('data-theme');
    component.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).not.toEqual(initialTheme);
  });

  it('should toggle locale', () => {
    const initialLocale = document.documentElement.getAttribute('lang');
    component.toggleLocale();
    expect(document.documentElement.getAttribute('lang')).not.toEqual(initialLocale);
  });
});
