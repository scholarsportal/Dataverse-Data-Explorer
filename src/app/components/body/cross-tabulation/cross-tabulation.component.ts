import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
  ],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossTabulationComponent implements OnInit {
  loadingStatus: 'init' | 'delayed' | '' = '';
  filterValue: string = '';
  store = inject(Store);
  liveAnnouncer = inject(LiveAnnouncer);
  translate = inject(TranslateService);
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

  opt1 = 'test';

  options = signal([
    'SHOW_VALUE',
    // 'Weighted Value',
    'ROW_PERC',
    'COL_PERC',
    'TOTAL_PERC',
  ]);

  selectedOption = signal('SHOW_VALUE');

  selectedOptionComputed = computed(() => {
    switch (this.selectedOption()) {
      case 'SHOW_VALUE':
        return 'Count';
      case 'ROW_PERC':
        return 'Count as Fraction of Rows';
      case 'COL_PERC':
        return 'Count as Fraction of Columns';
      case 'TOTAL_PERC':
        return 'Count as Fraction of Total';
      default:
        return 'Count';
    }
  });

  ngOnInit(): void {
    this.translate
      .get('CROSS_TABULATION.SHOW_VALUE')
      .subscribe((res: string) => {
        this.opt1 = res;
      });
  }

  getSelectedWeightVariableToString() {
    const fullVariable = this.variables()[this.selectedWeightVariable()];
    return fullVariable['labl']['#text'];
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
    let txt: string = '';
    this.translate.get('CROSS_TABULATION.NEW_ROW').subscribe((res: string) => {
      txt = res;
    });
    this.liveAnnouncer.announce(txt);
  }

  onWeightChange(event: { value: Variable | null }) {
    const variable: Variable | null = event?.value;
    const variableID = variable?.['@_ID'];
    const crossTabValues = this.crossTabVariables();
    console.log(event, 'variableID');
    this.store.dispatch(
      CrossTabulationUIActions.addWeightVariableToSelection({
        variableID: variableID ?? null,
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
