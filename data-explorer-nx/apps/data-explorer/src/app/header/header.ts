import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dde-header',
  host: { role: 'banner' },
  imports: [],
  template: `
    <div class="logo-and-title">
      <img src="logo.svg" alt="Odesi Logo" />
      <h1>Data Explorer</h1>
    </div>
  `,
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
