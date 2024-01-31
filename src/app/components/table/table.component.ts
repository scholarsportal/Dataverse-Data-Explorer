import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectCurrentVarList,
  selectCurrentVariableSelected,
} from 'src/app/state/selectors/var-groups.selectors';
import { ColumnMode, SelectionType, SortType } from '@swimlane/ngx-datatable';
import { Variable } from 'src/app/state/interface';
import { onSelectVariable } from 'src/app/state/actions/var-and-groups.actions';
import { VariableOptionsComponent } from './variable-options/variable-options.component';
import { TableNavComponent } from './table-nav/table-nav.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  @ViewChild('table') table: any;

  vars$ = this.store.select(selectCurrentVarList);
  selected: any[] = [];
  limit: number = 7;
  offset: number = 0;
  hoveredVariable: any;
  columns = [
    { name: 'check' },
    { name: 'ID' },
    { name: 'Name' },
    { name: 'Label' },
    { name: 'Weight' },
    { name: 'View/Edit' },
  ];

  ColumnMode = ColumnMode;
  SortType = SortType;
  SelectionType = SelectionType;

  constructor(private store: Store) {
    this.store
      .select(selectCurrentVariableSelected)
      .subscribe((variablesSelected) => {
        this.selected = variablesSelected;
      });
  }

  ngOnInit(): void {}

  onSelect({ selected }: any) {
    const variableIDs = selected.map((variable: Variable) => variable['@_ID']);
    this.store.dispatch(onSelectVariable({ variableIDs }));
  }

  onLimitChange(newLimit: number) {
    console.log(newLimit);
    this.limit = newLimit;
  }

  onPagePreviousClick() {
    this.offset -= 1;
  }

  onPageNextClick() {
    console.log(this.offset);
    this.offset += 1;
  }

  // on row hover
  onActivate(event: any) {
    this.hoveredVariable = event.row;
  }

  // ngx-datatables to calculate height
  getRowHeight(row: Variable) {
    if (!row || !row.labl['#text']) {
      return 50;
    }
    if (row.labl['#text'].length <= 45) {
      return 50;
    }
    return row.labl['#text'].length + 5;
  }
}
