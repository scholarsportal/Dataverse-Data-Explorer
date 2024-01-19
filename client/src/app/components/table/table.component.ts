import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectVariables } from 'src/state/selectors';
import { ModalComponent } from '../modal/modal.component';
import { SelectionModel } from '@angular/cdk/collections';
import { selectCurrentVarList } from 'src/app/state/selectors/var-groups.selectors';
import { ColumnMode, SortType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  @ViewChild('table') table: any;

  vars$ = this.store.select(selectCurrentVarList);
  vars: any = null;
  selected = false;

  columns = [
    { name: 'check' },
    { name: 'ID' },
    { name: 'Name' },
    { name: 'Label' },
    { name: 'Weight' },
    { name: 'View' },
    { name: 'Edit' },
  ];

  ColumnMode = ColumnMode;
  SortType = SortType;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.vars$.subscribe((vars) => {
      console.log(vars);
    });
  }

  viewChart(selection: any) {
    console.log(selection);
  }

  editVar(selection: any) {
    console.log(selection);
  }
}
