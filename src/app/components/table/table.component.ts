import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectCurrentVarList,
  selectCurrentVariableSelected,
} from 'src/app/state/selectors/var-groups.selectors';
import { ColumnMode, SelectionType, SortType } from '@swimlane/ngx-datatable';
import { Variable } from 'src/app/state/interface';
import { onSelectVariable } from 'src/app/state/actions/var-and-groups.actions';
import { selectOpenVariableModalMode } from 'src/app/state/selectors/open-variable.selectors';
import { ModalComponent } from './modal/modal.component';
import {
  openVariableChartModal,
  openVariableEditModal,
} from 'src/app/state/actions/ui.actions';
@Component({
  selector: 'dct-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  @ViewChild('table') table: any;
  @ViewChild(ModalComponent) ModalComponent?: ModalComponent;

  vars$ = this.store.select(selectCurrentVarList);
  modalMode$ = this.store.select(selectOpenVariableModalMode);
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

  // Launch Modal
  launchModal(data: { type: 'view' | 'edit'; variable: Variable }) {
    this.ModalComponent?.open();
    if (data.type === 'edit')
      return this.store.dispatch(
        openVariableEditModal({ variableID: data.variable['@_ID'] })
      );
    if (data.type === 'view')
      return this.store.dispatch(
        openVariableChartModal({ variableID: data.variable['@_ID'] })
      );
  }
}
