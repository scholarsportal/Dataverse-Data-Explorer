import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable } from 'src/app/state/interface';
import { Store } from '@ngrx/store';
import { selectOpenVariableModalMode } from 'src/app/state/selectors/open-variable.selectors';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'dct-variable-options',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './variable-options.component.html',
  styleUrl: './variable-options.component.css',
})
export class VariableOptionsComponent {
  store = inject(Store);
  @Input() variable!: Variable;
  @Output() launchModal: EventEmitter<any> = new EventEmitter<any>();

  modalMode$ = this.store.select(selectOpenVariableModalMode);

  launchView() {
    this.launchModal.emit({ type: 'view', variable: this.variable });
  }

  launchEdit() {
    this.launchModal.emit({ type: 'edit', variable: this.variable });
  }

  addToRows() {}

  removeFromRows() {}

  addToColumns() {}

  removeFromColumns() {}
}
