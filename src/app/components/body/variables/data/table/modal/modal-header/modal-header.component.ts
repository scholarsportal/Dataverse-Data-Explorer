import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';

@Component({
  selector: 'dct-modal-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-header.component.html',
  styleUrl: './modal-header.component.css'
})
export class ModalHeaderComponent {
  store = inject(Store);
  nextVar = input.required<string>();
  previousVar = input.required<string>();
  modalMode = input.required<'edit' | 'view'>();
  id = input.required<string>();
  name = input.required<string>();
  emitCloseModal = output();

  handleClose() {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable({ variableID: '' }));
    this.emitCloseModal.emit();
  }

  navigateToNextVariable() {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable({ variableID: this.nextVar(), mode: this.modalMode() }));
  }

  navigateToPreviousVariable() {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable({
      variableID: this.previousVar(),
      mode: this.modalMode()
    }));
  }

  switchToEdit() {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable({ mode: 'edit', variableID: this.id() }));
  }

  switchToView() {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable({ mode: 'view', variableID: this.id() }));
  }
}
