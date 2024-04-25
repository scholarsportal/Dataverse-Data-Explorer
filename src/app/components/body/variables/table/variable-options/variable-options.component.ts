import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ModalComponent } from '../modal/modal.component';
import { Variable } from 'src/app/new.state/xml/xml.interface';

@Component({
  selector: 'dct-variable-options-button',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './variable-options.component.html',
  styleUrl: './variable-options.component.css'
})
export class VariableOptionsComponent {
  store = inject(Store);
  variable = input.required<Variable>();
  launchModal = output<{ mode: 'view' | 'edit', variable: Variable }>();

  // modalMode$ = this.store.select(selectOpenVariableModalMode);

  launchView() {
    this.launchModal.emit({ mode: 'view', variable: this.variable() });
  }

  launchEdit() {
    this.launchModal.emit({ mode: 'edit', variable: this.variable() });
  }

  addToRows() {
  }

  removeFromRows() {
  }

  addToColumns() {
  }

  removeFromColumns() {
  }
}
