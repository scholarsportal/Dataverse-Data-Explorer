import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * The one place that decides whether the app is light or dark. The page
 * (`data-theme` on <body>), the header toggle and every chart read this
 * value, so they can never disagree. Charts that decided for themselves used
 * to draw white axis labels on a light page (issues #137, #157).
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private readonly current = signal<Theme>(this.initialTheme());

  readonly theme = this.current.asReadonly();
  readonly isDark = computed(() => this.current() === 'dark');

  constructor() {
    this.apply(this.current());
  }

  toggle(): void {
    const next: Theme = this.current() === 'dark' ? 'light' : 'dark';
    this.current.set(next);
    this.apply(next);
  }

  private apply(theme: Theme): void {
    this.document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked or full. The theme still applies for this
      // visit; it just will not be remembered.
    }
  }

  // Only 'light' and 'dark' are trusted. Anything else in storage (nothing
  // yet, or a value written by another tool on the same origin) falls back
  // to the operating system's preference.
  private initialTheme(): Theme {
    const stored = this.storedTheme();
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = this.document.defaultView?.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }

  private storedTheme(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
