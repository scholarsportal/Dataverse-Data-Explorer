import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { CrossTableComponent } from './cross-table/cross-table.component';

import { VariableSelectionComponent } from './variable-selection/variable-selection.component';
import { CrossTabulationUIActions } from '../../../new.state/ui/ui.actions';
import { selectCrossTabulationTableData } from '../../../new.state/ui/ui.selectors';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, VariableSelectionComponent, CrossTableComponent, DropdownModule, FormsModule],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossTabulationComponent {
  store = inject(Store);

  tableData = this.store.selectSignal(selectCrossTabulationTableData);
  table = computed(() => {
    return this.tableData().tableData;
  });
  rows = computed(() => {
    return this.tableData().rows;
  });

  cols = computed(() => {
    return this.tableData().cols;
  });

  options = signal(['Value', 'Weighted Value', 'Row Percentage', 'Column Percentage', 'Total Percentage']);
  selectedOption = signal('Value');

  // computedTable = computed(() => {
  //   const table: { [p: string]: string }[] = [];
  //   if (this.$table().length) {
  //     return this.$table();
  //   } else {
  //     return table;
  //   }
  // });
  // computedRows = computed(() => {
  //   return this.$tableRowsAndColumns().row;
  // });
  //
  // computedColumns = computed(() => {
  //   return this.$tableRowsAndColumns().column;
  // });
  //
  // allValuesLoaded = computed(() => {
  //   const lengthOfRows = this.computedRows().length !== 0;
  //   const lengthOfColumns = this.computedColumns().length !== 0;
  //   return lengthOfRows && lengthOfColumns && this.computedTable().length;
  // });
  //
  addNewEmptyRow() {
    this.store.dispatch(
      CrossTabulationUIActions.addToSelection({ variableID: '', orientation: '' })
    );
  }
}
