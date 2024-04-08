import {Component, computed, effect, inject, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MultiselectDropdownComponent} from '../../multiselect-dropdown/multiselect-dropdown.component';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule,} from '@angular/forms';
import {Store} from '@ngrx/store';
import {
  selectOpenVariableDataAsForm,
  selectOpenVariableSelectedGroups,
} from 'src/app/state/selectors/open-variable.selectors';
import {selectVariableWeights} from 'src/app/state/selectors/var-groups.selectors';
import {selectDatasetVariableGroups} from 'src/app/state/selectors/dataset.selectors';

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
export class EditComponent {
  store = inject(Store);
  $variableData = this.store.selectSignal(selectOpenVariableDataAsForm);
  $weights = this.store.selectSignal(selectVariableWeights);
  $allVariableGroups = this.store.selectSignal(selectDatasetVariableGroups);
  $groupsFromState = this.store.selectSignal(selectOpenVariableSelectedGroups);
  $allValuesInDropdown = computed(() => {
    const groups: { [id: string | number]: string } = {};
    this.$allVariableGroups()?.map((value) => {
      groups[value['@_ID']] = value.labl;
    });
    return groups;
  });
  $selectedGroups = signal(Object.keys(this.$groupsFromState()));

  variableForm = new FormGroup({
    id: new FormControl(''),
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl(''),
    isWeight: new FormControl(false),
    weight: new FormControl(''),
  });

  constructor() {
    effect(() => {
      if (this.$variableData()) {
        this.variableForm.patchValue(this.$variableData());
      }
    });
  }

  onGroupChange(groups: string[]) {
    this.$selectedGroups.set(groups);
  }

  // handleSave() {
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
  // }
}
