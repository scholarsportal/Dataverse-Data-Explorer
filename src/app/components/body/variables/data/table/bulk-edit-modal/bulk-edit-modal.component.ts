import { Component, ElementRef, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { XmlManipulationActions } from '../../../../../../new.state/xml/xml.actions';

@Component({
  selector: 'dct-bulk-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './bulk-edit-modal.component.html',
  styleUrl: './bulk-edit-modal.component.css'
})
export class BulkEditModalComponent {
  @ViewChild('bulkEdit') bulkEditModalElement?: ElementRef;
  selectedVariables = input.required<string[]>();

  // @Input() selected!: Variable[];
  variableForm = new FormGroup({
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl('')
  });

  constructor(private store: Store) {
  }

  openModal() {
    const editModal = this.bulkEditModalElement
      ?.nativeElement as HTMLDialogElement;
    editModal?.showModal();
  }

  closeModal() {
    const editModal = this.bulkEditModalElement
      ?.nativeElement as HTMLDialogElement;
    editModal?.close();
  }

  handleSave() {
    const newVariableValue = {
      label: this.variableForm.value.label || '',
      literalQuestion: this.variableForm.value.literalQuestion || '',
      interviewQuestion: this.variableForm.value.interviewQuestion || '',
      postQuestion: this.variableForm.value.postQuestion || '',
      universe: this.variableForm.value.universe || '',
      notes: this.variableForm.value.notes || ''
    };
    this.store.dispatch(XmlManipulationActions.bulkSaveVariableInfo({
      variableIDs: this.selectedVariables(),
      newVariableValue
    }));
  }

  handleCancel() {
    this.closeModal();
  }
}
