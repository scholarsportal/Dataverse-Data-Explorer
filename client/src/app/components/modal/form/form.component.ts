import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectGroupTitles, selectGroups, selectOpenVarDetail, selectOpenVariable } from 'src/state/selectors';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
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
    group: new FormGroup(''),
    isWeight: new FormControl(false),
    weightVar: new FormControl(''),
  })
  groups$ = this.store.select(selectGroups)
  groupTitles$ = this.store.select(selectGroupTitles)

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.store.select(selectOpenVarDetail).subscribe(data => {
      if (data) {
        console.log(data);
        this.variableForm.patchValue(data);
        console.log(this.variableForm);
      }
    })
  }

  getGroupsLabel(value: any) {
    return value?.item?.labl
  }

}
