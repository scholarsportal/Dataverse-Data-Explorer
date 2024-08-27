import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CrossTableComponent } from './cross-table/cross-table.component';

import { VariableSelectionComponent } from './variable-selection/variable-selection.component';
import { CrossTabulationUIActions } from '../../../new.state/ui/ui.actions';
import {
  selectCrossCharts,
  selectCrossTabulationTableData,
} from '../../../new.state/ui/ui.selectors';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { defaultCols, defaultRows, defaultTable } from './default-table';
import { CrossChartComponent } from './cross-chart/cross-chart.component';
import { SelectButtonModule } from 'primeng/selectbutton';

import 'node_modules/primeng/';
import { selectVariableCrossTabIsFetching } from '../../../new.state/dataset/dataset.selectors';

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
    SelectButtonModule,
  ],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossTabulationComponent {
  loadingStatus: 'init' | 'delayed' | '' = '';
  store = inject(Store);
  defaultColumns = defaultCols;
  defaultRows = defaultRows;
  defaultTable = defaultTable;
  tableData = this.store.selectSignal(selectCrossTabulationTableData);
  tableChart = this.store.selectSignal(selectCrossCharts);
  isFetching = this.store.selectSignal(selectVariableCrossTabIsFetching);
  chartOrTable = signal(['Chart', 'Table']);
  defaultDataView = signal('Table');
  table = computed(() => {
    const empty: { [key: string]: string }[] = [];
    return this.tableData()?.table || empty;
  });
  rows = computed(() => {
    return this.tableData().rows;
  });
  cols = computed(() => {
    return this.tableData().cols;
  });
  hasData = computed(() => {
    return !!this.tableData()?.rawTable.length;
  });
  hasRowOrColumn = computed(() => {
    return this.tableData()?.cols?.length || this.tableData()?.rows?.length;
  });
  options = signal([
    'Show Value',
    // 'Weighted Value',
    'Row Percentage',
    'Column Percentage',
    'Total Percentage',
  ]);
  selectedOption = signal('Show Value');
  selectedOptionComputed = computed(() => {
    switch (this.selectedOption()) {
      case 'Show Value':
        return 'Count';
      case 'Row Percentage':
        return 'Count as Fraction of Rows';
      case 'Column Percentage':
        return 'Count as Fraction of Columns';
      case 'Total Percentage':
        return 'Count as Fraction of Total';
      default:
        return 'Count';
    }
  });

  constructor() {
    effect(() => {
      if (this.isFetching()) {
        this.fetchingCheck();
      } else {
        this.loadingStatus = '';
      }
    });
  }

  fetchingCheck() {
    this.loadingStatus = 'init';
    setTimeout(() => {
      this.loadingStatus = 'delayed';
    }, 9000);
  }

  addNewEmptyRow() {
    this.store.dispatch(
      CrossTabulationUIActions.addToSelection({
        variableID: '',
        orientation: '',
      }),
    );
  }

  exportTable = () => {};
}
