import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable } from 'src/app/state/interface';
import { DropdownComponent } from './dropdown/dropdown.component';
import { Store } from '@ngrx/store';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import { CrossTableComponent } from './cross-table/cross-table.component';
import {
  selectAvailableVariables,
  selectColumnsAndRowsArray,
  selectColumnsArray,
  selectCurrentCrossTableData,
  selectRowsArray,
} from 'src/app/state/selectors/cross-tabulation.selectors';
import { Subscription } from 'rxjs';
import {
  CdkDragDrop,
  transferArrayItem,
  moveItemInArray,
  CdkDropList,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, DropdownComponent, CrossTableComponent, CdkDropList],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
})
export class CrossTabulationComponent {
  @ViewChild('pivotTable') pivotTableElement!: ElementRef;

  rows$ = this.store.select(selectRowsArray);
  rows: any = [];
  columns: any = [];
  columns$ = this.store.select(selectColumnsArray);
  groups$ = this.store.select(selectDatasetVariableGroups);
  variables$ = this.store.select(selectAvailableVariables);
  table$ = this.store.select(selectCurrentCrossTableData);
  sub$!: Subscription;

  constructor(private store: Store) {
    store
      .select(selectColumnsAndRowsArray)
      .pipe()
      .subscribe(({ rows, columns }) => {
        this.rows = rows;
        this.columns = columns;
      });
  }

  onDrop(event: CdkDragDrop<any[]>, type: 'rows' | 'columns') {
    if (event.previousContainer === event.container) {
      // If element is dropped in the same container, simply move it within the array
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      // If element is dropped in a different container, transfer it between arrays
      const droppedItem = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      // You may want to handle additional logic here, like updating your store
      console.log('Dropped', droppedItem, 'to', type);
    }
  }

  onVariableSelect(value: {
    type: 'rows' | 'columns';
    index: number;
    variable: Variable;
  }) {
    if (value.type && value.variable) {
      // this.store.dispatch(
      //   addVariable({
      //     index: value.index,
      //     variableID: value.variable['@_ID'],
      //     variableType: value.type,
      //   })
      // );
    }
  }
}
