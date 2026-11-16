import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatomoTracker } from 'ngx-matomo-client';

import { HeaderComponent } from './header.component';
import { globalInitialState } from '../../new.state/xml/xml.interface';
import { ThemeService } from '../../services/theme.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  function visitorHas(storedTheme: string | null): void {
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) =>
      key === 'theme' ? storedTheme : null,
    );
    spyOn(Storage.prototype, 'setItem');
  }

  function create(): void {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function themeToggle(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector(
      'input.theme-controller',
    ) as HTMLInputElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideMockStore({ initialState: globalInitialState }),
        provideHttpClient(),
        {
          provide: MatomoTracker,
          useValue: jasmine.createSpyObj<MatomoTracker>('MatomoTracker', [
            'setDocumentTitle',
            'trackPageView',
            'trackEvent',
          ]),
        },
      ],
    });
  });

  afterEach(() => document.body.removeAttribute('data-theme'));

  it('should create', () => {
    visitorHas('light');
    create();
    expect(component).toBeTruthy();
  });

  describe('theme toggle (issues #137, #157)', () => {
    it('is off on a light page', () => {
      visitorHas('light');
      create();
      expect(themeToggle().checked).toBe(false);
    });

    it('is on on a dark page', () => {
      visitorHas('dark');
      create();
      expect(themeToggle().checked).toBe(true);
    });

    it('switches the theme for the whole app', () => {
      visitorHas('light');
      create();
      themeToggle().dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(TestBed.inject(ThemeService).theme()).toBe('dark');
      expect(document.body.getAttribute('data-theme')).toBe('dark');
      expect(themeToggle().checked).toBe(true);
    });
  });
});
