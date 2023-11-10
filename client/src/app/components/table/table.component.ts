import {
  Component,
  Input,
  OnChanges,
  OnInit,
  AfterViewInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getDataFetchStatus,
  checkEditing,
  selectGroupVariables,
  selectVariables,
} from 'src/state/selectors';
import { ModalComponent } from '../modal/modal.component';
import { variableViewChart, variableViewDetail } from 'src/state/actions';
import { ColumnMode, SortType } from '@swimlane/ngx-datatable';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;

  // Material Table
  columnMat = ['ID', 'Name', 'Label', 'Weight', 'View', 'Edit'];
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  sortedData: any;

  columns = [
    { name: 'ID' },
    { name: 'Name' },
    { name: 'Label' },
    { name: 'Weight' },
    { name: 'View' },
    { name: 'Edit' },
  ];
  ColumnMode = ColumnMode;
  SortType = SortType;
  heading = '';
  @Input() openGroup?: string;
  vars$: any;
  loaded$ = this.store.select(getDataFetchStatus);
  isEditing$ = this.store.select(checkEditing);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectVariables).subscribe((data) => {
      if (data) {
        // this.vars$ = Object.values(data)
        this.vars$ = new MatTableDataSource(Object.values(data));
      }
    });
  }

  ngAfterViewInit() {
    this.vars$.paginator = this.paginator;
    this.vars$.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const openGroup = changes['openGroup'];
    if (openGroup.previousValue !== openGroup.currentValue) {
      this.store.select(selectGroupVariables).subscribe((data: any) => {
        this.vars$ = data;
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.vars$.filter = filterValue.trim().toLowerCase();

    if (this.vars$.paginator) {
      this.vars$.paginator.firstPage();
    }
  }

  // TODO: TO FIX
  sortData(sort: Sort) {
    const data = this.vars$;
    console.log(data);
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sortData(data, sort);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  setHeading(value: any) {
    const name = value['@_name'] || '';
    const label = value['labl']['#text'] || 'No Label';
    this.heading = `${name}: ${label}`;
  }

  viewChart(value: any) {
    this.store.dispatch(
      variableViewChart({ id: value['@_ID'], variable: value })
    );
    this.setHeading(value);
    this.modalComponent?.openModal();
  }

  editVar(value: any) {
    this.store.dispatch(variableViewDetail({ variable: value }));
    this.setHeading(value);
    this.modalComponent?.openModal();
  }

  close() {
    this.modalComponent?.closeModal();
  }
}
