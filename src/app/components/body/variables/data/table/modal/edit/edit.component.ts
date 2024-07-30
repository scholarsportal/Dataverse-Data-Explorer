import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownComponent } from '../../multiselect-dropdown/multiselect-dropdown.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { VariableForm } from 'src/app/new.state/ui/ui.interface';
import { VariableGroup } from 'src/app/new.state/xml/xml.interface';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { XmlManipulationActions } from '../../../../../../../new.state/xml/xml.actions';

@Component({
  selector: 'dct-edit',
  standalone: true,
  imports: [
    CommonModule,
    MultiselectDropdownComponent,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ChipModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {
  store = inject(Store);
  form = input.required<VariableForm>();
  variableGroups = input.required<string[]>();
  variableGroupsPlaceholder: string[] = [];
  variableID = input.required<string>();
  allGroups = input.required<{ [groupID: string]: VariableGroup }>();
  allGroupsArray = computed(() => {
    return Object.keys(this.allGroups());
  });
  decodedVariableGroups = computed(() => {
    // console.log(this.variableGroups());
    const varGroups: string[] = [];
    Object.values(this.allGroups()).map(group => {
      varGroups.push(group.labl);
    });
    return varGroups;
  });
  weights = input.required<{ [weightID: string]: string }>();
  emitFormChanged = output<boolean>();
  selected = signal<string[]>([]);
  variableForm = new FormGroup({
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl(''),
    isWeight: new FormControl(false),
    assignedWeight: new FormControl('')
  });
  saved: boolean = false;
  emitToast = output();

  constructor() {
    effect(() => {
      this.variableGroupsPlaceholder = this.variableGroups();
      this.variableForm.patchValue({
        label: this.form().label,
        literalQuestion: this.form().literalQuestion,
        interviewQuestion: this.form().interviewQuestion,
        postQuestion: this.form().postQuestion,
        universe: this.form().universe,
        isWeight: this.form().isWeight,
        assignedWeight: this.form().assignedWeight,
        notes: this.form().notes
      });
    });
  }

  changeGroup(change: MultiSelectChangeEvent) {
    if (change.value) {
      this.variableGroupsPlaceholder = change.value;
    }
  }

  handleSave() {
    const newVariableValue = {
      label: this.variableForm.value.label || '',
      literalQuestion: this.variableForm.value.literalQuestion || '',
      interviewQuestion: this.variableForm.value.interviewQuestion || '',
      postQuestion: this.variableForm.value.postQuestion || '',
      universe: this.variableForm.value.universe || '',
      notes: this.variableForm.value.notes || '',
      assignedWeight: this.variableForm.value.assignedWeight || '',
      isWeight: this.variableForm.value.isWeight || false
    };
    this.store.dispatch(XmlManipulationActions.saveVariableInfo({
      variableID: this.variableID(),
      groups: this.variableGroupsPlaceholder,
      newVariableValue
    }));
    this.emitToast.emit();
  }

  closeLoadedToast() {
    this.saved = false;
  }
}
