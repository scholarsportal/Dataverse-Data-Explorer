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

  private el: ElementRef;

  constructor(private store: Store, private element: ElementRef) {
    this.el = element;
  }

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
    if (this.columns && this.rows) {
      this.renderTable();
    }
  }

  renderTable() {
    const table: any[] = [];
    const rowTitle = this.rows?.['@_name'] + ' - ' + this.rows?.labl['#text'];
    const colTitle =
      this.columns?.['@_name'] + ' - ' + this.rows?.labl['#text'];
    this.rows?.catgry?.map((value) =>
      table.push({
        [rowTitle]: value.labl['#text'],
        count: value.catStat[0]['#text'],
      })
    );
    this.columns?.catgry?.map((value) =>
      table.push({
        [colTitle]: value.labl['#text'],
        count: value.catStat[0]['#text'],
      })
    );
    console.log(table);
  }
}
