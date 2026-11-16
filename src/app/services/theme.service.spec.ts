import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService (issues #137, #157)', () => {
  let stored: jasmine.Spy;
  let saved: jasmine.Spy;

  // What the visitor's browser holds: the stored theme preference (if any)
  // and whether the operating system asks for dark mode.
  function visitorHas(storedTheme: string | null, systemDark = false): void {
    stored = spyOn(Storage.prototype, 'getItem').and.callFake((key: string) =>
      key === 'theme' ? storedTheme : null,
    );
    saved = spyOn(Storage.prototype, 'setItem');
    spyOn(window, 'matchMedia').and.returnValue({
      matches: systemDark,
    } as MediaQueryList);
  }

  function service(): ThemeService {
    return TestBed.inject(ThemeService);
  }

  function pageTheme(): string | null {
    return document.body.getAttribute('data-theme');
  }

  afterEach(() => document.body.removeAttribute('data-theme'));

  describe('starting theme', () => {
    it('uses a stored light theme', () => {
      visitorHas('light', true);
      expect(service().theme()).toBe('light');
    });

    it('uses a stored dark theme', () => {
      visitorHas('dark', false);
      expect(service().theme()).toBe('dark');
    });

    it('follows a light operating system when nothing is stored', () => {
      visitorHas(null, false);
      expect(service().theme()).toBe('light');
    });

    it('follows a dark operating system when nothing is stored', () => {
      visitorHas(null, true);
      expect(service().theme()).toBe('dark');
    });

    it('ignores a stored value it does not recognise', () => {
      visitorHas('some-other-app-theme', false);
      expect(service().theme()).toBe('light');
    });

    it('ignores an empty stored value', () => {
      visitorHas('', true);
      expect(service().theme()).toBe('dark');
    });

    it('falls back to the operating system when storage cannot be read', () => {
      visitorHas(null, true);
      stored.and.throwError('storage blocked');
      expect(service().theme()).toBe('dark');
    });
  });

  describe('applying the theme', () => {
    it('sets the page theme as soon as it is created', () => {
      visitorHas('dark');
      service();
      expect(pageTheme()).toBe('dark');
    });

    it('never puts an unrecognised value on the page', () => {
      visitorHas('some-other-app-theme');
      service();
      expect(pageTheme()).toBe('light');
    });

    it('remembers the theme it settled on', () => {
      visitorHas(null, true);
      service();
      expect(saved).toHaveBeenCalledOnceWith('theme', 'dark');
    });

    it('still applies the theme when storage cannot be written', () => {
      visitorHas('light');
      saved.and.throwError('storage blocked');
      const theme = service();
      expect(() => theme.toggle()).not.toThrow();
      expect(theme.theme()).toBe('dark');
      expect(pageTheme()).toBe('dark');
    });
  });

  describe('toggle', () => {
    it('switches light to dark everywhere at once', () => {
      visitorHas('light');
      const theme = service();
      theme.toggle();
      expect(theme.theme()).toBe('dark');
      expect(theme.isDark()).toBe(true);
      expect(pageTheme()).toBe('dark');
      expect(saved).toHaveBeenCalledWith('theme', 'dark');
    });

    it('switches dark back to light', () => {
      visitorHas('dark');
      const theme = service();
      theme.toggle();
      expect(theme.theme()).toBe('light');
      expect(theme.isDark()).toBe(false);
      expect(pageTheme()).toBe('light');
      expect(saved).toHaveBeenCalledWith('theme', 'light');
    });
  });
});
