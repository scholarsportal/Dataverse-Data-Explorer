import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CrossTableComponent } from './cross-table/cross-table.component';
import {
  selectCurrentCrossTableData,
  selectRowsAndCategories
} from 'src/app/state/selectors/cross-tabulation.selectors';
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

  $tableRowsAndColumns = this.store.selectSignal(selectRowsAndCategories);
  $table = this.store.selectSignal(selectCurrentCrossTableData);

  computedTable = computed(() => {
    const table: { [p: string]: string }[] = [];
    if (this.$table().length) {
      return this.$table();
    } else {
      return table;
    }
  });
  computedRows = computed(() => {
    return this.$tableRowsAndColumns().row;
  });

  computedColumns = computed(() => {
    return this.$tableRowsAndColumns().column;
  });

  allValuesLoaded = computed(() => {
    const lengthOfRows = this.computedRows().length !== 0;
    const lengthOfColumns = this.computedColumns().length !== 0;
    return lengthOfRows && lengthOfColumns && this.computedTable().length;
  });

  addNewEmptyRow() {
    this.store.dispatch(
      addVariableToCrossTabulation({ variableID: '', orientation: 'row' })
    );
  }

  addNewEmptyColumn() {
    this.store.dispatch(
      addVariableToCrossTabulation({ variableID: '', orientation: 'column' })
    );
  }

}
