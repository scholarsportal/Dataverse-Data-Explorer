import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CrossTableComponent } from './cross-table/cross-table.component';
import {
  selectDatasetProcessedVariables,
  selectDatasetVariableGroups
} from 'src/app/state/selectors/dataset.selectors';
import { selectCurrentCrossTableData } from 'src/app/state/selectors/cross-tabulation.selectors';
import { addVariableToCrossTabulation } from 'src/app/state/actions/cross-tabulation.actions';
import { VariableSelectionComponent } from './variable-selection/variable-selection.component';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, VariableSelectionComponent, CrossTableComponent],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css'
})
export class CrossTabulationComponent {
  store = inject(Store);

  $groups = this.store.selectSignal(selectDatasetVariableGroups);
  $variables = this.store.selectSignal(selectDatasetProcessedVariables);
  table$ = this.store.select(selectCurrentCrossTableData);

  addNewEmptyRow() {
    this.store.dispatch(
      addVariableToCrossTabulation({ variableID: '', variableType: 'row' })
    );
  }

  addNewEmptyColumn() {
    this.store.dispatch(
      addVariableToCrossTabulation({ variableID: '', variableType: 'column' })
    );
  }

}
