import {CommonModule} from '@angular/common';
import {Component, inject,} from '@angular/core';
import {DropdownComponent} from './dropdown/dropdown.component';
import {Store} from '@ngrx/store';
import {CrossTableComponent} from './cross-table/cross-table.component';
import {selectDatasetProcessedVariables, selectDatasetVariableGroups} from 'src/app/state/selectors/dataset.selectors';
import {
  selectColumnsArray,
  selectCurrentCrossTableData,
  selectRowsArray,
  selectVariableColumnsCategories,
  selectVariableRowsCategories,
} from 'src/app/state/selectors/cross-tabulation.selectors';
import {
  addVariableToCrossTabulation,
  changeMissingVariables,
  changeVariableInGivenPosition
} from 'src/app/state/actions/cross-tabulation.actions';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, DropdownComponent, CrossTableComponent],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
})
export class CrossTabulationComponent {
  store = inject(Store);

  $rows = this.store.selectSignal(selectRowsArray);
  $columns = this.store.selectSignal(selectColumnsArray);
  $groups = this.store.selectSignal(selectDatasetVariableGroups);
  $variables = this.store.selectSignal(selectDatasetProcessedVariables);
  $rowCategories = this.store.selectSignal(selectVariableRowsCategories)
  $columnCategories = this.store.selectSignal(selectVariableColumnsCategories)
  table$ = this.store.select(selectCurrentCrossTableData);

  addNewEmptyRow() {
    this.store.dispatch(
      addVariableToCrossTabulation({variableID: '', variableType: 'rows'}),
    );
  }

  addNewEmptyColumn() {
    this.store.dispatch(
      addVariableToCrossTabulation({variableID: '', variableType: 'columns'}),
    );
  }

  changeSelectedCategories(values: { index: number, variableType: 'rows' | 'columns', missingVariables: string[] }) {
    const {index, missingVariables, variableType} = values
    this.store.dispatch((
      changeMissingVariables({
        index, variableType, missingVariables
      })
    ))
  }

  changeVariable(value: { variableID: string, index: number, variableType: 'rows' | 'columns' }) {
    const {index, variableID, variableType} = value
    this.store.dispatch(
      changeVariableInGivenPosition({
        index,
        variableType,
        variableID,
      }),
    )
  }
}
