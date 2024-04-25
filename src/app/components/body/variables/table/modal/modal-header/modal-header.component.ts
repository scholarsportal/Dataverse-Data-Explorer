import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'dct-modal-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-header.component.html',
  styleUrl: './modal-header.component.css'
})
export class ModalHeaderComponent {
  @Input() nextVar!: string | null | undefined;
  @Input() previousVar!: string | null | undefined;
  @Output() closeVariableModal: EventEmitter<any> = new EventEmitter<any>();
  // modalMode$ = this.store.select(selectOpenVariableModalMode);
  // id$ = this.store.select(selectOpenVariableID);
  // name$ = this.store.select(selectOpenVariableDataName);

  constructor(private store: Store) {
  }

  handleClose() {
    this.closeVariableModal.emit();
  }

  // navigateToNextVariable(id: string | null | undefined) {
  //   if (id) {
  //     this.store.dispatch(changeOpenVariable({ variableID: id }));
  //   }
  // }
  //
  // switchToEdit() {
  //   this.store.dispatch(changeVariableModalMode({ modalMode: 'edit' }));
  // }
  //
  // switchToView() {
  //   this.store.dispatch(changeVariableModalMode({ modalMode: 'view' }));
  // }
}
