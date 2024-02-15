import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Variable } from 'src/app/state/interface';
import { DropdownComponent } from './dropdown/dropdown.component';
import { Store } from '@ngrx/store';
import {
  selectDatasetVariableGroups,
  selectDatasetVariables,
} from 'src/app/state/selectors/dataset.selectors';
import { CrossTableComponent } from './cross-table/cross-table.component';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, DropdownComponent, CrossTableComponent],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
})
export class CrossTabulationComponent {
  @ViewChild('pivotTable') pivotTableElement!: ElementRef;

  groups$ = this.store.select(selectDatasetVariableGroups);
  variables$ = this.store.select(selectDatasetVariables);
  rows: Variable | null = null;
  columns: Variable | null = null;
  table: any[] = [];
  rowTitles: string[] = [];
  colTitles: string[] = [];

  constructor(private store: Store) {}

  onVariableSelect(value: {
    type: 'row' | 'column';
    index: number;
    variable: Variable;
  }) {
    if (value.type === 'row') {
      this.rows = value.variable;
    }
    if (value.type === 'column') {
      this.columns = value.variable;
    }
    if (this.columns?.catgry && this.rows?.catgry) {
      this.renderTable(this.rows, this.columns);
    }
  }

  renderTable(rows: Variable, columns: Variable) {}

  tablePopulated() {
    return this.table.length && this.rowTitles.length && this.colTitles.length;
  }
}
