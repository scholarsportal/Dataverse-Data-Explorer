import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Variable } from 'src/app/state/interface';
import { bulkEditVariables } from 'src/app/state/actions/var-and-groups.actions';

@Component({
  selector: 'dct-bulk-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './bulk-edit-modal.component.html',
  styleUrl: './bulk-edit-modal.component.css',
})
export class BulkEditModalComponent {
  @ViewChild('bulkEdit') bulkEditModalElement?: ElementRef;
  @Input() selected!: Variable[];

  constructor(private store: Store) {}

  variableForm = new FormGroup({
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl(''),
  });

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
    if (this.selected && this.variableForm.value && this.variableForm.valid) {
      const selected = JSON.parse(JSON.stringify(this.selected));
      const value = this.variableForm.value;
      const variables: { [id: string]: Variable } = {};
      selected.map((element: Variable) => {
        element.labl['#text'] = value.label ?? element.labl['#text'];
        element['qstn'] = {
          qstnLit: value.literalQuestion ?? element.qstn?.qstnLit ?? '',
          ivuInstr: value.interviewQuestion ?? element.qstn?.ivuInstr ?? '',
          postQTxt: value.postQuestion ?? element.qstn?.postQTxt ?? '',
        };
        element.universe = value.universe ?? element.universe;
        element.notes['#text'] = value.notes ?? element.notes['#text'];
        variables[element['@_ID']] = element;
      });
      this.store.dispatch(bulkEditVariables({ variables }));
    }
  }

  handleCancel() {}
}
