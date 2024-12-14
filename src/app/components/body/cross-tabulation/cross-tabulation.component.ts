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
  selectCrossTabulationData,
  selectSelectedWeightVariable,
} from '../../../new.state/ui/ui.selectors';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CrossChartComponent } from './cross-chart/cross-chart.component';
import { SelectButtonModule } from 'primeng/selectbutton';

import 'node_modules/primeng/';
import {
  selectDatasetVariableCrossTabValues,
  selectVariableCrossTabIsFetching,
} from '../../../new.state/dataset/dataset.selectors';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { selectDatasetProcessedVariables } from 'src/app/new.state/xml/xml.selectors';
import { Variable } from 'src/app/new.state/xml/xml.interface';
import { generateCrossTabCSV } from '../../../new.state/ui/util';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule
  ],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossTabulationComponent {
  loadingStatus: 'init' | 'delayed' | '' = '';
  store = inject(Store);
  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  crossTabVariables = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  selectedWeightVariable = this.store.selectSignal(
    selectSelectedWeightVariable,
  );
  tableData = this.store.selectSignal(selectCrossTabulationData);
  tableChart = this.store.selectSignal(selectCrossCharts);
  isFetching = this.store.selectSignal(selectVariableCrossTabIsFetching);
  rows = computed(() => this.tableData().rows);
  cols = computed(() => {
    return this.tableData().cols;
  });
  hasData = computed(() => this.tableData().hasData);
  variablesWithWeightedOnTop = computed(() => {
    const newVariables: any[] = [];
    Object.values(this.variables()).forEach((variable) => {
      if (variable['@_wgt'] === 'wgt') {
        // move the variable to the beginning of the array
        newVariables.unshift(variable);
      } else {
        newVariables.push(variable);
      }
    });
    return newVariables.length > 0
      ? newVariables
      : Object.values(this.variables());
  });
  chartOrTable = signal(['Chart', 'Table']);
  defaultDataView = signal('Table');
  table = computed(() => this.tableData().pivotData);
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

  constructor(private liveAnnouncer: LiveAnnouncer) {
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
    this.liveAnnouncer.announce('New row added above.');
  }

  onWeightChange(event: { value: Variable }) {
    const variable: Variable = event.value;
    const variableID = variable['@_ID'];
    const crossTabValues = this.crossTabVariables();
    this.store.dispatch(
      CrossTabulationUIActions.startVariableWeightSelection({
        variableID,
        crossTabValues,
      }),
    );
  }

  exportTableAsCSV() {
    const csvData = generateCrossTabCSV({
      rows: this.rows(),
      cols: this.cols(),
      table: this.table() as { [id: string]: string; value: string }[],
    });

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvData], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Get current date for filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `cross-tabulation-${date}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  }
}
