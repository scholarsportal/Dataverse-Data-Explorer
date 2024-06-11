import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariableGroup } from 'src/app/new.state/xml/xml.interface';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CrossTabulationUIActions } from 'src/app/new.state/ui/ui.actions';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { selectDatasetProcessedVariables } from 'src/app/new.state/xml/xml.selectors';

/**
 * This is a dumb component. It should not accept any Observable. The values (groups, variables, selectedVariable,
 * categoryList, filteredCategories) should be inputs, and should emit changes via output. The parent smart component
 * should be charge of transforming the data, and dispatching the action. This means this component (which can appear,
 * and disappear at any point in the DOM), will not make multiple state checks for values that won't change (groups,
 * variables)*/
@Component({
  selector: 'dct-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectModule, DropdownModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  store = inject(Store);
  // Inputs
  index = input.required<number>();
  groups = input.required<{ [groupID: string]: VariableGroup }>();
  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  variableOrientation = input.required<'rows' | 'cols' | ''>();
  selectedVariableID = input.required<string>();
  variablesAlreadySelected = input.required<string[]>();
  categories = input.required<{
    [variableID: string]: { [categoryID: string]: string };
  }>();
  missing = input.required<{ [variableID: string]: string[] }>();
  // Output
  emitChangeVariableOrientation = output<{
    newOrientation: 'rows' | 'cols' | '';
    index: number;
    variableID: string;
  }>();
  emitChangeSelectedVariable = output<{
    variableID: string;
    index: number;
    orientation: 'rows' | 'cols' | '';
  }>();
  emitRemoveVariable = output<{ index: number }>();
  // Component Values
  selectedGroup = signal<string | null>(null);

  filteredVariables = computed(() => {
    const newVariables: {
      variableID: string;
      label: string;
      disabled: boolean;
    }[] = [];
    const selectedGroupID = this.selectedGroup() || '';
    const selectedGroup = this.groups()[selectedGroupID] || null;
    if (selectedGroup) {
      selectedGroup?.['@_var']?.split(' ').map((variableID: string) =>
        newVariables.push({
          variableID: variableID,
          label: this.variables()[variableID].labl['#text'],
          disabled: this.variablesAlreadySelected().includes(variableID),
        }),
      );
      return newVariables;
    } else {
      Object.values(this.variables()).map((variable) => {
        newVariables.push({
          variableID: variable['@_ID'],
          label: variable.labl['#text'],
          disabled: this.variablesAlreadySelected().includes(variable['@_ID']),
        });
      });
      return newVariables;
    }
  });

  filteredCategories = computed(() => {
    if (
      this.selectedVariableID() &&
      this.categories()[this.selectedVariableID()]
    ) {
      return this.categories()[this.selectedVariableID()];
    } else {
      const emptySet: { [categoryID: string]: string } = {};
      return emptySet;
    }
  });

  filteredMissing = computed(() => {
    if (
      this.selectedVariableID() &&
      this.missing()[this.selectedVariableID()]
    ) {
      return this.missing()[this.selectedVariableID()];
    } else {
      const emptySet: string[] = [];
      return emptySet;
    }
  });

  hasCategories = computed(() => {
    return this.categories()[this.selectedVariableID()]
      ? Object.keys(this.categories()[this.selectedVariableID()]).length > 0
      : false;
  });
  filterValue: string = '';

  onChangeVariableOrientation(value: string) {
    if (value === 'rows') {
      this.emitChangeVariableOrientation.emit({
        index: this.index(),
        newOrientation: 'rows',
        variableID: this.selectedVariableID(),
      });
    }
    if (value === 'cols') {
      this.emitChangeVariableOrientation.emit({
        index: this.index(),
        newOrientation: 'cols',
        variableID: this.selectedVariableID(),
      });
    }
  }

  onGroupChange(value: string) {
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

  onVariableChange(value: string) {
    this.filterValue = '';
    if (value) {
      this.emitChangeSelectedVariable.emit({
        index: this.index(),
        orientation: this.variableOrientation(),
        variableID: value,
      });
    }
  }

  changeMissingValues(missing: string[]) {
    this.store.dispatch(
      CrossTabulationUIActions.changeMissingCategories({
        variableID: this.selectedVariableID(),
        missing,
      }),
    );
  }

  removeVariable(index: number) {
    this.emitRemoveVariable.emit({ index });
  }

  logIT(item: unknown) {
    console.log(item);
  }
}
