import { Component, input } from '@angular/core';
import { Icons } from '../common/icons';

@Component({
  selector: 'dde-content-switcher',
  imports: [Icons],
  host: {
    style: 'display: flex; flex-direction: row; justify-content: space-between',
  },
  template: `
    <div class="content-switcher">
      <button class="content-switcher-button" [class.selected]="currentContent() === 'variables'">
        <dde-icons [name]="currentContent() === 'variables' ? 'variables-selected' : 'variables'" />
        <span>Variables</span>
      </button>
      <button class="content-switcher-button" [class.selected]="currentContent() === 'cross-tab'">
        <dde-icons name="cross-tab" />
        <span>Cross Tabulation</span>
      </button>
    </div>
    <div class="data-options">
      <button class="data-options-button">
        <dde-icons name="download" />
        <span>Download</span>
      </button>
      <button class="data-options-button">
        <dde-icons name="upload" />
        <span>Save to Dataverse</span>
      </button>
    </div>
  `,
  styleUrl: './content-switcher.css',
})
export class ContentSwitcher {
  currentContent = input.required();
}
