import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable, VariableGroup } from 'src/app/state/interface';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MultiselectDropdownComponent } from '../../table/multiselect-dropdown/multiselect-dropdown.component';

/**
 * This is a dumb component. It should not accept any Observable. The values (groups, variables, selectedVariable,
 * categoryList, filteredCategories) should be inputs, and should emit changes via output. The parent smart component
 * should be charge of transforming the data, and dispatching the action. This means this component (which can appear,
 * and disappear at any point in the DOM), will not make multiple state checks for values that won't change (groups,
 * variables)*/
@Component({
  selector: 'dct-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiselectDropdownComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  store = inject(Store);
  // Inputs
  $index = input.required<number>();
  $groups = input.required<VariableGroup[]>();
  $variables = input.required<{ [id: string]: Variable }>();
  $rowsOrColumns = input.required<'rows' | 'columns'>();
  $selectedVariable = input.required<string>();
  $variablesAlreadySelected =
    input.required<{ variableID: string; missingCategories: string[] }[]>();
  $categories = input.required<{ [p: string]: { categories: { [p: number]: string }, missing: string[] } }>();
  // Output
  changeSelectedVariable = output<{ variableID: string, index: number, variableType: 'rows' | 'columns' }>();
  changeSelectedCategories = output<{
    index: number,
    variableID: string,
    variableType: 'rows' | 'columns',
    missing: string[]
  }>();
  // Component Values
  $selectedGroup = signal<string | null>(null);

  // constructor() {
  //   effect(() => {
  //     console.log(this.$selectedVariable());
  //     // console.log(this.$type());
  //   });
  // }
  //
  $computedVariablesAlreadySelected = computed(() => {
    const variableList: string[] = [];
    this.$variablesAlreadySelected().map((variableData) => {
      variableList.push(variableData.variableID);
    });
    return variableList;
  });

  $filteredVariables = computed(() => {
    if (this.$selectedGroup()) {
      const newVariables: Variable[] = [];
      this.$selectedGroup()
        ?.split(' ')
        .map((variableID: string) =>
          newVariables.push(this.$variables()[variableID])
        );
      return newVariables;
    } else {
      return Object.values(this.$variables());
    }
  });

  $selectedVariableCategoryValues = computed(() => {
    const values: { [id: string]: string } = {};
    if (this.$selectedVariable()) {
      return this.$categories()[this.$selectedVariable()]?.categories;
    }
    return values;
  });

  $selectedVariableSelectedCategoryValues = computed(() => {
    const values: string[] = [];
    if (this.$selectedVariable()) {
      return this.$categories()[this.$selectedVariable()]?.missing ?? [];
    }
    return values;
  });

  changeMissingValues(missing: string[]) {
    const index = this.$index();
    const variableID = this.$selectedVariable();
    const variableType = this.$rowsOrColumns();
    if (this.$selectedVariable()) {
      this.changeSelectedCategories.emit({ index, missing, variableID, variableType });
    }
  }

  onChangeCategoriesSelected(newCategoryList: string[]) {
  }

  checkVariableSelected(variableID: string): boolean {
    return (
      this.$computedVariablesAlreadySelected().includes(variableID) &&
      this.$selectedVariable() !== variableID
    );
  }

  onGroupChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value && value !== 'all') {
      this.$selectedGroup.set(value);
    } else if (value === 'all') {
      this.$selectedGroup.set(null);
    }
  }

  onVariableChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value) {
      this.changeSelectedVariable.emit({
        index: this.$index(),
        variableType: this.$rowsOrColumns(),
        variableID: value
      });
    }
  }
}
