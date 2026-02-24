import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { Body } from './body/body';

@Component({
  imports: [Header, Body],
  selector: 'dde-root',
  template: `
    <dde-header class="header bg-gray-400" />
    <dde-body
      [currentBody]="currentBody()"
      (switchBody)="switchBody()"
      class="body"
    />
  `,
  styleUrl: './app.css',
})
export class App {
  currentBody = signal<'variables' | 'crosstab'>('variables');

  switchBody() {
    this.currentBody.update((current) =>
      current === 'variables' ? 'crosstab' : 'variables',
    );
  }
}
