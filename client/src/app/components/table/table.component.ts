import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { getDataFetchStatus, selectDatasetVars } from 'src/state/selectors';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;

  columns = [{ name: 'ID' }, { name: 'Name' }, { name: 'Label' }, { name: 'Weight' }, { name: 'View' }, { name: 'Edit' },]
  dtOptions: any;
  selected = []
  currentVar: any = undefined;
  editing: boolean = false;

  vars$ = this.store.select(selectDatasetVars);
  loaded$ = this.store.select(getDataFetchStatus)

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.dtOptions = {
      data: this.vars$,
      paging: true,
      pagingType: 'full_numbers',
      columns: [
        { "data": "ID" },
        { "data": "Name" },
        { "data": "Label" },
        { "data": "Weight" },
        { "data": "View" },
        { "data": "Edit" },
      ]
    };
  }

  show(value: any, edit: boolean = false) {
    this.currentVar = value
    if (edit) {
      this.editing = false
    } else {
      this.editing = true
    }
    console.log(value)
    this.modalComponent?.openModal();
  }

}
