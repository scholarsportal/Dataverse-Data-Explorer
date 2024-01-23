import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectVariables } from 'src/state/selectors';
import { ModalComponent } from '../modal/modal.component';
import { SelectionModel } from '@angular/cdk/collections';
import { selectCurrentVarList } from 'src/app/state/selectors/var-groups.selectors';
import { ColumnMode, SelectionType, SortType } from '@swimlane/ngx-datatable';
import { Variable } from 'src/app/state/interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
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

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.vars$.subscribe((vars) => {
      console.log(vars);
    });
  }

  onSelect({ selected }: any) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
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

  viewChart(selection: any) {
    console.log(selection);
  }

  editVar(selection: any) {
    console.log(selection);
  }
}
