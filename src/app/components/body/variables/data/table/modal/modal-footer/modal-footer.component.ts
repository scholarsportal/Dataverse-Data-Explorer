import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectOpenVariableMode } from 'src/app/new.state/ui/ui.selectors';

@Component({
  selector: 'dct-modal-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-footer.component.html',
  styleUrl: './modal-footer.component.css'
})
export class ModalFooterComponent {
  store = inject(Store);
  modalMode$ = this.store.select(selectOpenVariableMode);
  emitCloseModal = output();

  handleClose() {
    this.emitCloseModal.emit();
  }
}
