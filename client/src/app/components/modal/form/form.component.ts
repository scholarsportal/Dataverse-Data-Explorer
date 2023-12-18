import { Component, OnChanges, ViewChild, Input, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ModalComponent } from '../modal.component';
import { SingleVariable, VariableForm } from 'src/state/interface';
import { selectOpenVariableGroups } from 'src/state/selectors/modal.selectors';
import {
  openModalChangesMade,
  variableSave,
} from 'src/state/actions/modal.actions';
import { Observable, take } from 'rxjs';
import { selectVariableWeights } from 'src/state/selectors';
import { saveVariableBulkEdit } from 'src/state/actions';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnChanges {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  @Input() variable$: VariableForm | null = null ;
  @Input() modalState$: Observable<string> | null = null;
  @Input() variableWeight$: any | null = null;
  @Input() selection: string[] = [] ;

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
    isWeight: new FormControl(false),
    weightVar: new FormControl('')
  });

  constructor(private store: Store) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['variable$']?.currentValue !== changes['variable$']?.previousValue) {
      if(changes['variable$'].currentValue) {
        this.patchForm(changes['variable$'].currentValue)
      } else {
        this.resetForm()
      }
    }
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
      isWeight: new FormControl(false),
    weightVar: new FormControl('')
    });
  }

  // Change the variableGroup$ param
  onGroupChange(groups: any) {
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

  handleSave(){
    if(this.variable$){
      const updatedVariable: SingleVariable = {
        labl: {
          '#text': this.variableForm.controls.label.value || this.variable$.label,
        },
        qstn: {
          qstnLit: this.variableForm.controls.literalQuestion.value || this.variable$.literalQuestion,
          ivuInstr: this.variableForm.controls.interviewerQuestion.value || this.variable$.interviewerQuestion,
          postQTxt: this.variableForm.controls.postQuestion.value || this.variable$.postQuestion,
        },
        universe: this.variableForm.controls.universe.value || this.variable$.universe,
        notes: this.variableForm.controls.notes.value || this.variable$.notes,
        '@_wgt': this.variableForm.controls.isWeight.value ? 'wgt' : '',
        '@_wgt-var': ( !this.variableForm.controls.isWeight.value && this.variableWeight$) ? this.variableWeight$['@_ID'] : '',
      };
      this.selection.length ? this.handleBulkEditSave(updatedVariable) : this.handleSingleVariableSave(updatedVariable);
    }
  }

  handleSingleVariableSave(updatedVariable: SingleVariable) {
    this.store.dispatch(variableSave({ variable: updatedVariable, groups: this.variableGroups$, id: this.variable$?.id || '' }))
  }

  handleBulkEditSave(updatedVariable: SingleVariable) {
    this.store.dispatch(saveVariableBulkEdit({ variableIDs: this.selection, template: updatedVariable }))
  }

  // TODO: Check if current variable has changes (using ngRx selector), if changes, show "Are you Sure", else,
  // close dialogue
  handleCancel() {
    this.modalComponent?.closeModal();
  }

  close() {
    this.modalComponent?.closeModal();
  }
}
