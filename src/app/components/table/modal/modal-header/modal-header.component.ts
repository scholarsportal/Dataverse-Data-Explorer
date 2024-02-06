import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectOpenVariableModalMode } from 'src/app/state/selectors/ui.selectors';
import { changeVariableModalMode } from 'src/app/state/actions/ui.actions';

@Component({
  selector: 'dct-modal-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-header.component.html',
  styleUrl: './modal-header.component.css',
})
export class ModalHeaderComponent {
  @Output() closeVariableModal: EventEmitter<any> = new EventEmitter<any>();
  modalMode$ = this.store.select(selectOpenVariableModalMode);

  constructor(private store: Store) {}

  handleClose() {
    this.closeVariableModal.emit();
  }

  switchToEdit() {
    this.store.dispatch(changeVariableModalMode({ modalMode: 'edit' }));
  }

  switchToView() {
    this.store.dispatch(changeVariableModalMode({ modalMode: 'view' }));
  }
}
