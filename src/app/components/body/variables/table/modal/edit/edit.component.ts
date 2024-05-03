import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownComponent } from '../../multiselect-dropdown/multiselect-dropdown.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { VariableForm } from '../../../../../../new.state/ui/ui.interface';
import { VariableGroup } from '../../../../../../new.state/xml/xml.interface';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'dct-edit',
  standalone: true,
  imports: [
    CommonModule,
    MultiselectDropdownComponent,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {
  store = inject(Store);
  form = input.required<VariableForm>();
  variableGroups = input.required<string[]>();
  variableGroupsPlaceholder: string[] = [];
  allGroups = input.required<{ [groupID: string]: VariableGroup }>();
  allGroupsArray = computed(() => {
    return Object.keys(this.allGroups());
  });
  decodedVariableGroups = computed(() => {
    console.log(this.variableGroups());
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
    (this.variableForm.valueChanges.subscribe(data => {
      console.log(data);
    }));
    //   if (this.variableForm.value?.id && this.groups) {
    //     const newGroups: string[] = [];
    //     const variable: VariableForm = {
    //       id: this.variableForm.value.id,
    //       label: this.variableForm.value.label ?? '',
    //       literalQuestion: this.variableForm.value.literalQuestion ?? '',
    //       interviewQuestion: this.variableForm.value.interviewQuestion ?? '',
    //       postQuestion: this.variableForm.value.postQuestion ?? '',
    //       notes: this.variableForm.value.notes ?? '',
    //       universe: this.variableForm.value.universe ?? '',
    //       isWeight: this.variableForm.value.isWeight ?? false,
    //       weight: this.variableForm.value.weight ?? null,
    //     };
    //     this.groups.map((value) => {
    //       newGroups.push(value['@_ID']);
    //     });
    //     this.store.dispatch(
    //       saveVariable({
    //         variableID: this.variableForm.value.id,
    //         variable,
    //         groups: newGroups,
    //       }),
    //     );
    //   }
  }
}
