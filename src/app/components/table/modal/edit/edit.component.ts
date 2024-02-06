import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownComponent } from '../../multiselect-dropdown/multiselect-dropdown.component';
import { Store } from '@ngrx/store';
import { selectOpenVariableDataAsForm } from 'src/app/state/selectors/ui.selectors';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { VariableGroup } from 'src/app/state/interface';

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
  variableWeight: any;
  weights: { [id: string]: string } | null = null;
  groups: VariableGroup[] = [];

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
    weight: new FormControl(''),
  });

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.sub$ = this.store
      .select(selectOpenVariableDataAsForm)
      .subscribe((value) => {
        if (value) {
          this.groups = value.groups;
          this.weights = value.variableWeights;
          this.variableWeight = value.formData.weight;
          this.variableForm.patchValue(value?.formData);
        }
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
