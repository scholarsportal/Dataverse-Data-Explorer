import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ModalComponent } from '../modal.component';
import { VarGroups } from 'src/state/interface';
import { selectOpenModalDetail } from 'src/state/selectors/modal.selectors';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  variables: any;
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
    weightVar: new FormControl(null),
  });
  groups: VarGroups = {};
  varWeights: any = [];
  weight: any = '';
  weightName: any = '';
  group = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    const variableDetails = this.store.select(selectOpenModalDetail);
    variableDetails.subscribe(({ variable, groups, varWeights }) => {
      if (variable && groups && varWeights) {
        this.groups = groups;
        this.varWeights = varWeights;
        this.weight = variable.weightVar
        this.variableForm.patchValue(variable);
      }
    });
  }

  close() {
    this.modalComponent?.closeModal();
  }

  // TODO: Check if current variable has changes (using ngRx selector), if changes, show "Are you Sure", else,
    // close dialogue
  handleCancel() {
    console.log('')
  }

  getWeightsLabels() {
    const values: any = []
    Object.values(this.varWeights).map((variable: any) => values.push(variable['@_name']));
    return values
  }
}
