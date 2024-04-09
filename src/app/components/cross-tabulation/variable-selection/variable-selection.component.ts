import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { KeyValuePipe } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';
import {
  selectCategoriesForSelectedVariables,
  selectedVariablesInCrossTab,
  selectMissingCategoriesForSelectedVariables,
  selectVariablesMetadata
} from '../../../state/selectors/cross-tabulation.selectors';
import {
  changeMissingVariables,
  changeOrientionInGivenPosition,
  changeVariableInGivenPosition,
  fetchCrossTabValuesAndChangeVariableInGivenPosition,
  removeVariableFromCrossTabulation
} from '../../../state/actions/cross-tabulation.actions';
import {
  selectDatasetProcessedVariables,
  selectDatasetVariableGroups
} from '../../../state/selectors/dataset.selectors';

@Component({
  selector: 'dct-variable-selection',
  standalone: true,
  imports: [
    KeyValuePipe,
    DropdownComponent
  ],
  templateUrl: './variable-selection.component.html',
  styleUrl: './variable-selection.component.css'
})
export class VariableSelectionComponent {
  /** This is a smart component. It handles all communication with the store,
   * publishing and subscribing to values and then passing them to the dumb
   * components below.
   * This variable handles the following subscriptions:
   * - rowsAndColumnsInState
   * - currentCrossTabValues
   * And it publishes the following information:
   * - removing rows, columns
   * - changing variable in given index */

  store = inject(Store);
  groups = this.store.selectSignal(selectDatasetVariableGroups);
  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  categories = this.store.selectSignal(selectCategoriesForSelectedVariables);
  missing = this.store.selectSignal(selectMissingCategoriesForSelectedVariables);
  selectedVariables = this.store.selectSignal(selectedVariablesInCrossTab);
  // Current values in cross tab
  variablesMetadata = this.store.selectSignal(selectVariablesMetadata);

  valuesAlreadyFetchedInCrossTab = computed(() => {
    const values: { [variableID: string]: boolean } = {};
    Object.keys(this.variablesMetadata()).map((key) => {
      // values[key] = this.variablesMetadata()[key].crossTabValues ? true : false;
      values[key] = !!this.variablesMetadata()[key].crossTabValues;
    });
    return values;
  });

  selectedVariablesArray = computed(() => {
    return Object.values(this.selectedVariables());
  });

  variablesAlreadySelected = computed(() => {
    const variables: string[] = [];
    Object.keys(this.selectedVariables()).map((_, index) => {
      variables.push(this.selectedVariables()[index].variableID);
    });
    return variables;
  });

  onVariableOrientationChange(value: { newOrientation: 'row' | 'column', index: number }) {
    this.store.dispatch(changeOrientionInGivenPosition({ ...value }));
  }

  changeVariableInGivenPosition(value: { orientation: 'row' | 'column', variableID: string, index: number }) {
    const { variableID } = value;
    if (this.valuesAlreadyFetchedInCrossTab()[variableID]) {
      this.store.dispatch(changeVariableInGivenPosition({ ...value }));
    } else {
      this.store.dispatch(fetchCrossTabValuesAndChangeVariableInGivenPosition({ ...value }));
    }
  }

  changeMissingCategoriesForVariable(value: { variableID: string, missing: string[] }) {
    const { variableID, missing } = value;
    this.store.dispatch(changeMissingVariables({ variableID, missing }));
  }

  removeVariable(index: number) {
    this.store.dispatch(removeVariableFromCrossTabulation({ index }));
  }
}
