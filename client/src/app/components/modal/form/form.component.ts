import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { VarGroups } from 'src/state/reducers';
import {
  selectGroups,
  selectOpenVarDetail,
} from 'src/state/selectors';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
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
    weightVar: new FormControl(''),
  });
  groups: VarGroups = {};
  group = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    const variableDetails = this.store.select(selectOpenVarDetail);
    variableDetails.subscribe(({ variable, groups }) => {
      if (variable && groups) {
        this.groups = groups;
        const variableGroups = Object.keys( variable.groups ) as never[]
        this.variableForm.patchValue(variable);
        this.variableForm.patchValue({ group: variableGroups });
        console.log(this.variableForm)
      }
    });
  }

  getGroupsLabel(value: any) {
    console.log(value.labl['#text'])
    return value.labl['#text']
  }

  checkSelected(value: any) {
    console.log(value)
    // return value.labl['#text'] === this.group;
    return false
  }
}
