import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownComponent } from '../../multiselect-dropdown/multiselect-dropdown.component';
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
export class EditComponent implements OnInit {
  sub$?: Subscription;
  @Input() variableData!: any;
  @Input() weights!: { [id: string]: string } | null;
  @Input() groups!: VariableGroup[] | null;

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

  ngOnInit(): void {
    this.variableForm.patchValue(this.variableData);
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
