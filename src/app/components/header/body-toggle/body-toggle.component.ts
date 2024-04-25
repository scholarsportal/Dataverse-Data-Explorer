import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dct-body-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './body-toggle.component.html',
  styleUrl: './body-toggle.component.css'
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

  closeCrossTab() {
    this.changeToggleState.emit('variables');
  }

  openCrossTab() {
    this.changeToggleState.emit('cross-tab');
  }
}
