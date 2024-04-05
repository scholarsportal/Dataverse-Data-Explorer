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
  index = input.required<number>();
  groups = input.required<VariableGroup[]>();
  variables = input.required<{ [id: string]: Variable }>();
  variableOrientation = input.required<'row' | 'column'>();
  selectedVariableID = input.required<string>();
  variablesAlreadySelected =
    input.required<string[]>();
  categories = input.required<{ [variableID: string]: { [categoryID: string]: string } }>();
  missing = input.required<{ [variableID: string]: string[] }>();
  // Output
  emitChangeVariableOrientation = output<'row' | 'column'>();
  emitChangeSelectedVariable = output<{ variableID: string, index: number, variableType: 'row' | 'column' }>();
  emitChangeSelectedCategories = output<{
    index: number,
    variableID: string,
    variableType: 'row' | 'column',
    missing: string[]
  }>();
  emitRemoveVariable = output<{ index: number }>();
  // Component Values
  selectedGroup = signal<string | null>(null);

  filteredVariables = computed(() => {
    if (this.selectedGroup()) {
      const newVariables: Variable[] = [];
      this.selectedGroup()
        ?.split(' ')
        .map((variableID: string) =>
          newVariables.push(this.variables()[variableID])
        );
      return newVariables;
    } else {
      return Object.values(this.variables());
    }
  });

  filteredCategories = computed(() => {
    if (this.selectedVariableID() && this.categories()[this.selectedVariableID()]) {
      return this.categories()[this.selectedVariableID()];
    } else {
      const emptySet: { [categoryID: string]: string } = {};
      return emptySet;
    }
  });

  filteredMissing = computed(() => {
    if (this.selectedVariableID() && this.missing()[this.selectedVariableID()]) {
      return this.missing()[this.selectedVariableID()];
    } else {
      const emptySet: string[] = [];
      return emptySet;
    }
  });

  onChangeVariableOrientation(event: Event) {
    const value: any | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value && value === 'row') {
      this.emitChangeVariableOrientation.emit('row');
    }
    if (value && value === 'column') {
      this.emitChangeVariableOrientation.emit('column');
    }
  }

  onGroupChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value && value !== 'all') {
      this.selectedGroup.set(value);
    } else if (value === 'all') {
      this.selectedGroup.set(null);
    }
  }

  checkVariableSelected(variableID: string): boolean {
    return (
      this.variablesAlreadySelected().includes(variableID) &&
      this.selectedVariableID() !== variableID
    );
  }

  onVariableChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value) {
      this.emitChangeSelectedVariable.emit({
        index: this.index(),
        variableType: this.variableOrientation(),
        variableID: value
      });
    }
  }

  changeMissingValues(missing: string[]) {
    const index = this.index();
    const variableID = this.selectedVariableID();
    const variableType = this.variableOrientation();
    if (this.selectedVariableID()) {
      this.emitChangeSelectedCategories.emit({ index, missing, variableID, variableType });
    }
  }

  removeVariable(index: number) {
    this.emitRemoveVariable.emit({ index });
  }
}
