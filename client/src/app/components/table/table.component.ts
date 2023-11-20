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
import { VarGroups, Variables } from 'src/state/reducers';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @Input() openGroup?: string;

  isEditing$ = this.store.select(checkEditing);
  vars: any = null;
  selected = false;
  selection: any = new SelectionModel<any>(true, [])

  columnMat = ['check', 'ID', 'Name', 'Label', 'Weight', 'View', 'Edit'];
  heading = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectVariables).subscribe((data) => {
      if (data) {
        this.vars = new MatTableDataSource(Object.values(data));
        this.vars.paginator = this.paginator;
        this.vars.sort = this.sort;
      }
    });
  }

  ngAfterViewInit() {
    this.store.select(selectVariables).subscribe((data) => {
      if (data) {
        this.vars = new MatTableDataSource(Object.values(data));
        this.vars.paginator = this.paginator;
        this.vars.sort = this.sort;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const openGroup = changes['openGroup'];
    if (openGroup.previousValue !== openGroup.currentValue) {
      this.store.select(selectGroupVariables).subscribe((data: any) => {
        this.vars = new MatTableDataSource(data);
        this.vars.paginator = this.paginator;
        this.vars.sort = this.sort;
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.vars.filter = filterValue.trim().toLowerCase();

    if (this.vars.paginator) {
      this.vars.paginator.firstPage();
    }
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.vars.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.vars.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  close() {
    this.modalComponent?.closeModal();
  }
}
