import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectOpenVariableModalMode } from 'src/app/state/selectors/ui.selectors';

@Component({
  selector: 'dct-modal-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-footer.component.html',
  styleUrl: './modal-footer.component.css',
})
export class ModalFooterComponent {
  @Output() closeVariableModal: EventEmitter<any> = new EventEmitter<any>();
  modalMode$ = this.store.select(selectOpenVariableModalMode);

  constructor(private store: Store) {}

  handleClose() {
    this.closeVariableModal.emit();
  }
}
