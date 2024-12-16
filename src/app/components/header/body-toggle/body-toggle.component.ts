import { Component, computed, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-body-toggle',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './body-toggle.component.html',
  styleUrl: './body-toggle.component.css',
})
export class BodyToggleComponent {
  toggleState = input.required<'cross-tab' | 'variables'>();
  changeToggleState = output<'cross-tab' | 'variables'>();
  variablesOpen = computed(() => {
    return this.toggleState() === 'variables';
  });

  crossTabOpen = computed(() => {
    return this.toggleState() === 'cross-tab';
  });

  openVariables() {
    this.changeToggleState.emit('variables');
  }

  openCrossTab() {
    this.changeToggleState.emit('cross-tab');
  }
}
