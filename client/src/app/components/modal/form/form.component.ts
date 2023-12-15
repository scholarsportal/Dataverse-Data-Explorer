import { Component, OnChanges, ViewChild, Input, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ModalComponent } from '../modal.component';
import { SingleVariable } from 'src/state/interface';
import { selectOpenVariableGroups } from 'src/state/selectors/modal.selectors';
import {
  openModalChangesMade,
  variableSave,
} from 'src/state/actions/modal.actions';
import { Observable, take } from 'rxjs';
import { selectVariableWeights } from 'src/state/selectors';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnChanges {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  @Input() variable$: any | null = null ;
  @Input() modalState$: Observable<string> | null = null;
  @Input() variableWeight$: any | null = null;

  @Input() variableGroups$: any = {};
  formGroup: any = {};
  allWeights$: Observable<any> = this.store.select(selectVariableWeights);

  variableForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl(''),
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewerQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl(''),
    group: new FormControl([]),
    isWeight: new FormControl(false),
  });

  constructor(private store: Store) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['variable$'].currentValue !== changes['variable$'].previousValue) {
      if(changes['variable$'].currentValue) {
        this.patchForm(changes['variable$'].currentValue)
      } else {
        this.resetForm()
      }
    }
    console.log(this.variable$)
  }

  private patchForm(variable: any) {
    this.variableForm.patchValue(variable)
  }

  private resetForm(){
    this.variableForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl(''),
      label: new FormControl(''),
      literalQuestion: new FormControl(''),
      interviewerQuestion: new FormControl(''),
      postQuestion: new FormControl(''),
      universe: new FormControl(''),
      notes: new FormControl(''),
      group: new FormControl([]),
      isWeight: new FormControl(false),
    });
  }

  // Change the variableGroup$ param
  onGroupChange(groups: any) {
    // TODO
    console.log(this.variableGroups$)
    this.variableGroups$ = groups
  }

  // Change the variableWeight$ param
  changeWeight(variable: any) {
    // TODO
    if(variable){
      this.variableWeight$ = variable
    } else {
      this.variableWeight$ = null;
    }
  }

  handleSave() {
    console.log(this.variableWeight$)
  }

  // TODO: Check if current variable has changes (using ngRx selector), if changes, show "Are you Sure", else,
  // close dialogue
  handleCancel() {
    console.log('');
  }

  close() {
    this.modalComponent?.closeModal();
  }
}
