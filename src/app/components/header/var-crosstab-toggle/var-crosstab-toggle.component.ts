import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dct-var-crosstab-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './var-crosstab-toggle.component.html',
  styleUrl: './var-crosstab-toggle.component.css',
})
export class VarCrosstabToggleComponent {
  // This is our own style guide. Dollar sign in front to denote signal,
  // dollar sign behind to denote observable
  $isCrossTabOpen = input.required();
  toggleVarCrossTab = output<boolean>();

  closeCrossTab() {
    this.toggleVarCrossTab.emit(false);
  }

  openCrossTab() {
    this.toggleVarCrossTab.emit(true);
  }
}
