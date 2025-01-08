// Path: src/app/components/body/variables/data/table/modal/modal-footer/modal-footer.component.ts
import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectOpenVariableMode } from 'src/app/new.state/ui/ui.selectors';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-modal-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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
