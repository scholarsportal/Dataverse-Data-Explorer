import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, combineLatestAll, merge } from 'rxjs';
import {
  selectGroupTitles,
  selectGroups,
  selectOpenVarDetail,
  selectOpenVariable,
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
    group: new FormControl(''),
    isWeight: new FormControl(false),
    weightVar: new FormControl(''),
  });
  groups: any = [];
  group = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    const groupDetails = this.store.select(selectGroups);
    const variableDetails = this.store.select(selectOpenVarDetail);
    const componentVariables = combineLatest([groupDetails, variableDetails]);
    componentVariables.subscribe((data) => {
      if (data && data[1] && data[0]) {
        this.groups = data[0];
        this.variableForm.patchValue(data[1]);
        this.group = data[1].group;
      }
    });
  }

  getGroupsLabel(value: any) {
    return value?.item?.labl;
  }

  checkSelected(value: any) {
    return value.item.labl === this.group;
  }
}
