import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable } from 'src/app/state/interface';
import { DropdownComponent } from './dropdown/dropdown.component';
import { Store } from '@ngrx/store';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import { CrossTableComponent } from './cross-table/cross-table.component';
import {
  selectAvailableVariables,
  selectColumnsArray,
  selectCurrentCrossTableData,
  selectRowsArray,
} from 'src/app/state/selectors/cross-tabulation.selectors';
import { addVariable } from 'src/app/state/actions/cross-tabulation.actions';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, DropdownComponent, CrossTableComponent],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
})
export class CrossTabulationComponent {
  @ViewChild('pivotTable') pivotTableElement!: ElementRef;

  rows$ = this.store.select(selectRowsArray)
  columns$ = this.store.select(selectColumnsArray)
  groups$ = this.store.select(selectDatasetVariableGroups);
  variables$ = this.store.select(selectAvailableVariables);
  table$ = this.store.select(selectCurrentCrossTableData);

  constructor(private store: Store) {}

  onVariableSelect(value: {
    type: 'rows' | 'columns';
    index: number;
    variable: Variable;
  }) {
    if (value.type && value.variable) {
      this.store.dispatch(
        addVariable({
          index: value.index,
          variableID: value.variable['@_ID'],
          variableType: value.type,
        })
      );
    }
  }
}
