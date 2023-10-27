import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { getDataFetchStatus, selectDatasetVars } from 'src/state/selectors';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  datatableOptions: any;
  vars$ = this.store.select(selectDatasetVars);
  loaded$ = this.store.select(getDataFetchStatus)

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.datatableOptions = {
      pagingType: 'full_numbers',
    };
  }

  show(varur: any){
    console.log(varur)
  }
}
