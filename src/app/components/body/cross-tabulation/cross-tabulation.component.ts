import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { CrossTableComponent } from './cross-table/cross-table.component';

import { VariableSelectionComponent } from './variable-selection/variable-selection.component';
import { CrossTabulationUIActions } from '../../../new.state/ui/ui.actions';
import { selectCrossTabulationTableData } from '../../../new.state/ui/ui.selectors';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { defaultCols, defaultRows, defaultTable } from './default-table';
import { CrossChartComponent } from './cross-chart/cross-chart.component';
import { SelectButtonModule } from 'primeng/selectbutton';

import 'node_modules/primeng/';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [
    CommonModule,
    VariableSelectionComponent,
    CrossTableComponent,
    DropdownModule,
    FormsModule,
    CrossChartComponent,
    SelectButtonModule
  ],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossTabulationComponent {
  store = inject(Store);
  defaultColumns = defaultCols;
  defaultRows = defaultRows;
  defaultTable = defaultTable;
  tableData = this.store.selectSignal(selectCrossTabulationTableData);
  chartOrTable = signal(['Chart', 'Table']);
  defaultDataView = signal('Table');

  table = computed(() => {
    return this.tableData().table;
  });

  rows = computed(() => {
    return this.tableData().rows;
  });

  cols = computed(() => {
    return this.tableData().cols;
  });

  hasData = computed(() => {
    return this.tableData().table?.length > 0;
  });

  hasRowOrColumn = computed(() => {
    return this.tableData().cols.length || this.tableData().rows.length;
  });

  options = signal([
    'Show Value',
    'Weighted Value',
    'Row Percentage',
    'Column Percentage',
    'Total Percentage'
  ]);
  selectedOption = signal('Show Value');
  selectedOptionComputed = computed(() => {
    switch (this.selectedOption()) {
      case 'Show Value':
        return 'Count';
        break;
      case 'Row Percentage':
        return 'Count as Fraction of Rows';
        break;
      case 'Column Percentage':
        return 'Count as Fraction of Columns';
        break;
      case 'Total Percentage':
        return 'Count as Fraction of Total';
        break;
      default:
        return 'Count';
        break;
    }
  });

  addNewEmptyRow() {
    this.store.dispatch(
      CrossTabulationUIActions.addToSelection({
        variableID: '',
        orientation: ''
      })
    );
  }

  exportTable = () => {
  };
}
