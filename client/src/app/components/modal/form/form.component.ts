import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ModalComponent } from '../modal.component';
import { SingleVariable, VarGroups } from 'src/state/interface';
import { selectOpenModalDetail, selectOpenVariable } from 'src/state/selectors/modal.selectors';
import { Observable, take } from 'rxjs';
import { updateGroups } from './form.util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  variable$: Observable<SingleVariable> = this.store.select(selectOpenVariable);
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

  handleSave() {
    this.variable$.pipe(take(1)).subscribe((variable: SingleVariable) => {
      if (variable) {
        const groupsFromForm = this.variableForm.controls.group.value || [];
        const updatedGroups = Object.keys(groupsFromForm).reduce((acc: any, groupId: any) => {
          acc[groupId] = groupsFromForm[groupId];
          return acc;
        }, {});

        const updatedVariable: SingleVariable = {
          ...variable, // Spread the properties of the original variable object
          labl: {
            ...variable.labl, // Spread the properties of labl
            '#text': this.variableForm.controls.label.value || variable.labl['#text'],
          },
          qstn: {
            ...variable.qstn, // Spread the properties of qstn
            qstnLit: this.variableForm.controls.literalQuestion.value || variable.qstn.qstnLit,
            ivuInstr: this.variableForm.controls.interviewerQuestion.value || variable.qstn.ivuInstr,
            postQTxt: this.variableForm.controls.postQuestion.value || variable.qstn.postQTxt,
          },
          universe: this.variableForm.controls.universe.value || variable.universe,
          notes: this.variableForm.controls.notes.value || variable.notes,
          // TODO: Dont quite work
          groups: {
            ...variable.groups,
            ...updatedGroups
          },
        };
        console.log(groupsFromForm)
      }
    })
  }

  // updateGroups = (groups: any) => updateGroups(groups)

  getWeightsLabels() {
    const values: any = []
    Object.values(this.varWeights).map((variable: any) => values.push(variable['@_name']));
    return values
  }
}
