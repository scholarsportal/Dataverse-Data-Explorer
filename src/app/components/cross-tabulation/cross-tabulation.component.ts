import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
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
import { addVariableToCrossTabulation } from 'src/app/state/actions/cross-tabulation.actions';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, DropdownComponent, CrossTableComponent],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
})
export class CrossTabulationComponent {
  @ViewChild('pivotTable') pivotTableElement!: ElementRef;
  store = inject(Store);

  $rows = this.store.selectSignal(selectRowsArray);
  $columns = this.store.selectSignal(selectColumnsArray);
  groups$ = this.store.select(selectDatasetVariableGroups);
  variables$ = this.store.select(selectAvailableVariables);
  table$ = this.store.select(selectCurrentCrossTableData);

  $crossTabulationRowsAndColumns = computed(() => {
    return [...this.$columns(), ...this.$rows()];
  });

  addNewEmptyRow() {
    this.store.dispatch(
      addVariableToCrossTabulation({ variableID: '', variableType: 'rows' }),
    );
  }

  addNewEmptyColumn() {
    this.store.dispatch(
      addVariableToCrossTabulation({ variableID: '', variableType: 'columns' }),
    );
  }
}
