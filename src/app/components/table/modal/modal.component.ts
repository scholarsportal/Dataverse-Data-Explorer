import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { EditComponent } from './edit/edit.component';
import { Store } from '@ngrx/store';
import { closeVariableModal } from 'src/app/state/actions/ui.actions';
import { ModalHeaderComponent } from './modal-header/modal-header.component';
import { ModalFooterComponent } from './modal-footer/modal-footer.component';
import { selectOpenVariableModalMode } from 'src/app/state/selectors/ui.selectors';

@Component({
  selector: 'dct-modal',
  standalone: true,
  imports: [
    CommonModule,
    ChartComponent,
    EditComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @ViewChild('variableModal') variableModal?: ElementRef;
  modalMode = this.store.select(selectOpenVariableModalMode);

  constructor(private store: Store) {}

  open() {
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    modal.showModal();
  }

  close() {
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    modal.close();
    this.store.dispatch(closeVariableModal());
  }

  // Listen for escape and dispatach close action
  @HostListener('document:keydown.escape', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    if (modal?.open && event.key === 'Escape') {
      this.store.dispatch(closeVariableModal());
    }
  }
}
