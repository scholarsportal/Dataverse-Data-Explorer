import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ContentSwitcher } from './content-switcher';

@Component({
  selector: 'dde-header',
  imports: [NgOptimizedImage, ContentSwitcher],
  template: `
    <div class="header-info surface-container">
      <div class="logo-and-buttons">
        <div class="logo-with-text">
          <img ngSrc="logo.png" height="15" width="20" alt="Odesi Logo" />
          <span class="data-explorer-text">Data Explorer</span>
        </div>
        <div>
          <button (click)="toggleLocale()">test</button>
          <select name="language-toggle" id="language-toggle">
            <option value="en-fr">Fr</option>
          </select>
        </div>
      </div>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
    </div>
    <dde-content-switcher class="header-switcher" currentContent="variables" />
  `,
  styleUrl: './header.css',
})
export class Header {
  title = input.required<string>();
  description = input.required<string>();
  currentContent = input.required<'variables' | 'cross-tab'>();

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
  }

  toggleLocale() {
    const currentLocale = document.documentElement.getAttribute('lang');
    document.documentElement.setAttribute('lang', currentLocale === 'en-CA' ? 'fr-CA' : 'en-CA');
  }
}
