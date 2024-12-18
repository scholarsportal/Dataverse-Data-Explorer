import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-modal-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './modal-header.component.html',
  styleUrl: './modal-header.component.css',
})
export class ModalHeaderComponent {
  store = inject(Store);
  nextVar = input.required<string>();
  previousVar = input.required<string>();
  hasApiKey = input.required<boolean>();
  modalMode = input.required<'EDIT_VAR' | 'VIEW_VAR'>();
  id = input.required<string>();
  name = input.required<string>();
  emitCloseModal = output();

  handleClose() {
    this.store.dispatch(
      VariableTabUIAction.changeOpenVariable({ variableID: '' }),
    );
    this.emitCloseModal.emit();
  }

  navigateToNextVariable() {
    this.store.dispatch(
      VariableTabUIAction.changeOpenVariable({
        variableID: this.nextVar(),
        mode: this.modalMode(),
      }),
    );
  }

  navigateToPreviousVariable() {
    this.store.dispatch(
      VariableTabUIAction.changeOpenVariable({
        variableID: this.previousVar(),
        mode: this.modalMode(),
      }),
    );
  }

  switchToEdit() {
    this.store.dispatch(
      VariableTabUIAction.changeOpenVariable({
        mode: 'EDIT_VAR',
        variableID: this.id(),
      }),
    );
  }

  switchToView() {
    this.store.dispatch(
      VariableTabUIAction.changeOpenVariable({
        mode: 'VIEW_VAR',
        variableID: this.id(),
      }),
    );
  }
}
