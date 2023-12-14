import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ModalComponent } from '../modal.component';
import { SingleVariable } from 'src/state/interface';
import {
  selectCheckModalMode,
  selectOpenModalDetail,
  selectOpenModalVariable,
  selectOpenModalVariableWeight,
  selectOpenVariableGroups,
} from 'src/state/selectors/modal.selectors';
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
export class FormComponent implements OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  @Input() variable: Observable<SingleVariable> = this.store.select(
    selectOpenModalVariable
  );
  @Input() variableGroups$: Observable<any> = this.store.select(
    selectOpenVariableGroups
  );
  @Input() variableWeight$: Observable<any> | any = '';
  @Input() modalState: Observable<string> =
    this.store.select(selectCheckModalMode);
  @Input() allGroups$: Observable<string> =
    this.store.select(selectCheckModalMode);
  @Input() allWeights$: Observable<any> = this.store.select(
    selectVariableWeights
  );

  variable$: Observable<SingleVariable> = this.store.select(
    selectOpenModalVariable
  );
  groups$: Observable<{ [id: string]: string } | null> = this.store.select(
    selectOpenVariableGroups
  );
  modalState$: Observable<string> = this.store.select(selectCheckModalMode);
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
  groups: { [id: string]: string } | null = {};
  weight: any = '';
  weightName: any = '';
  group = '';

  constructor(private store: Store) {
    this.allWeights$.pipe(take(1)).subscribe((data: any) => {
      console.log(data);
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectOpenModalDetail)
      .subscribe(
        ({ variable, groups, weightedVariable, allVariableWeights }) => {
          if (variable && groups && allVariableWeights) {
            console.log(variable);
            this.groups = groups;
            this.weight = weightedVariable;
            this.variableForm.patchValue(variable);
          }
        }
      );
  }

  close() {
    this.modalComponent?.closeModal();
  }

  onGroupChange(groups: any) {
    this.groups = groups;
  }

  getWeightsLabels(value: any) {
    return value['@_name'];
  }

  changeWeight(variable: any) {
    console.log(variable);
    // return variable === this.weight
    this.variableWeight$ = variable === '' ? null : variable;
  }

  // TODO: Check if current variable has changes (using ngRx selector), if changes, show "Are you Sure", else,
  // close dialogue
  handleCancel() {
    console.log('');
  }

  handleSave() {
    this.variable$.pipe(take(1)).subscribe((variable: SingleVariable) => {
      if (variable) {
        // console.log(variable);

        const updatedVariable: SingleVariable = {
          ...variable, // Spread the properties of the original variable object
          labl: {
            ...variable.labl, // Spread the properties of labl
            '#text':
              this.variableForm.controls.label.value || variable.labl['#text'],
          },
          qstn: {
            ...variable.qstn, // Spread the properties of qstn
            qstnLit:
              this.variableForm.controls.literalQuestion.value ||
              variable.qstn.qstnLit,
            ivuInstr:
              this.variableForm.controls.interviewerQuestion.value ||
              variable.qstn.ivuInstr,
            postQTxt:
              this.variableForm.controls.postQuestion.value ||
              variable.qstn.postQTxt,
          },
          universe:
            this.variableForm.controls.universe.value || variable.universe,
          notes: this.variableForm.controls.notes.value || variable.notes,
          '@_wgt': this.variableForm.controls.isWeight.value
            ? 'wgt'
            : undefined,
          '@_wgt-var':
            !this.variableForm.controls.isWeight.value && this.weight
              ? this.weight['@_ID']
              : undefined,
        };

        this.store.dispatch(
          variableSave({
            id: variable['@_ID'],
            variable: updatedVariable,
            groups: this.groups,
          })
        );
      }
    });
  }
}
