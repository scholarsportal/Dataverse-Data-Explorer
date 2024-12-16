import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { KeyValuePipe, NgClass } from '@angular/common';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
} from 'src/app/new.state/xml/xml.selectors';
import { DropdownComponent } from './dropdown/dropdown.component';
import {
  selectCrossTabCategoriesMissing,
  selectCrossTabSelection,
} from '../../../../new.state/ui/ui.selectors';
import {
  selectDatasetAllVariableCategories,
  selectDatasetVariableCrossTabValues,
} from '../../../../new.state/dataset/dataset.selectors';
import { CrossTabulationUIActions } from '../../../../new.state/ui/ui.actions';

@Component({
  selector: 'dct-variable-selection',
  standalone: true,
  imports: [DropdownComponent, NgClass],
  templateUrl: './variable-selection.component.html',
  styleUrl: './variable-selection.component.css',
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
  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  categories = this.store.selectSignal(selectDatasetAllVariableCategories);
  missing = this.store.selectSignal(selectCrossTabCategoriesMissing);
  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  selection = this.store.selectSignal(selectCrossTabSelection);
  // Current values in cross tab
  variablesMetadata = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  selectedVariable: string = '';
  variablesAlreadySelected = computed(() => {
    const variables: string[] = [];
    Object.values(this.selection()).map((value) => {
      variables.push(value.variableID);
    });
    return variables;
  });

  onVariableOrientationChange(value: {
    newOrientation: 'rows' | 'cols' | '';
    index: number;
    variableID: string;
  }) {
    const { newOrientation, index, variableID } = value;
    this.store.dispatch(
      CrossTabulationUIActions.changeValueInGivenIndex({
        orientation: newOrientation,
        index,
        variableID,
      }),
    );
  }

  changeVariableInGivenPosition(value: {
    orientation: 'rows' | 'cols' | '';
    variableID: string;
    index: number;
  }) {
    const { variableID, index, orientation } = value;
    this.store.dispatch(
      CrossTabulationUIActions.changeValueInGivenIndex({
        index,
        variableID,
        orientation,
      }),
    );
  }

  removeVariable(value: { index: number }) {
    const { index } = value;
    this.store.dispatch(
      CrossTabulationUIActions.removeVariablesUsingIndex({ index }),
    );
    // this.store.dispatch(removeVariableFromCrossTabulation({ index }));
  }
}
