import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownComponent } from '../../multiselect-dropdown/multiselect-dropdown.component';
import { Store } from '@ngrx/store';
import {
  selectOpenVariableData,
  selectOpenVariableWeight,
} from 'src/app/state/selectors/ui.selectors';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { selectVariableWeights } from 'src/app/state/selectors/var-groups.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dct-edit',
  standalone: true,
  imports: [
    CommonModule,
    MultiselectDropdownComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent implements OnInit, OnDestroy {
  sub$?: Subscription;
  variable$ = this.store.select(selectOpenVariableData);
  weights$ = this.store.select(selectVariableWeights);
  variableWeight: any;

  variableForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl(''),
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewerQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl(''),
    groups: new FormControl([]),
    isWeight: new FormControl(false),
  });

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.sub$ = this.store
      .select(selectOpenVariableWeight)
      .subscribe((value) => {
        this.variableWeight = value;
      });
  }

  ngOnDestroy(): void {
    this.sub$?.unsubscribe();
  }

  changeWeight(variable: any) {
    console.log(variable);
  }

  getID(variable: any) {
    console.log(variable);
  }

  handleSave() {
    console.log('save');
  }

  handleCancel() {
    console.log('cancel');
  }
}
