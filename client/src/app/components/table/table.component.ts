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
  selectGroupVariables,
  selectVariables,
  selectGroups,
  checkOpenGroup,
} from 'src/state/selectors';
import { ModalComponent } from '../modal/modal.component';
import {  variableViewChart, variableViewDetail } from 'src/state/actions';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { take } from 'rxjs';
import { variableAddToSelectGroup, variableRemoveFromSelectGroup } from 'src/state/actions/group.actions';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatSort) sort?: MatSort;
  @Input() openGroup?: string;

  groups$ = this.store.select(selectGroups);
  selectedGroup$ = this.store.select(checkOpenGroup)
  vars$ = this.store.select(selectVariables)
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
      } else {
        this.vars = new MatTableDataSource([])
      }
        this.vars.paginator = this.paginator;
        this.vars.sort = this.sort;
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
    this.table?.renderRows()
  }

  ngOnChanges(changes: SimpleChanges): void {
    const openGroup = changes['openGroup'];
    if (openGroup.previousValue !== openGroup.currentValue) {
      this.store.select(selectGroupVariables).subscribe((data: any) => {
        // console.log(data)
        this.vars = new MatTableDataSource(data);
        this.vars.paginator = this.paginator;
        this.vars.sort = this.sort;
      });
      this.table?.renderRows()
    }
  }

  addToGroup(group: any) {
    // console.log(group['@_ID'])
    // console.log(this.selection.selected)
    this.store.dispatch(variableAddToSelectGroup({ groupID: group['@_ID'], variableIDs: this.selection.selected }))
  }

  removeFromGroup() {
    this.selectedGroup$.pipe(take(1)).subscribe((group: any) => {
      console.log(group)
        this.store.dispatch(variableRemoveFromSelectGroup({ groupID: group, variableIDs: this.selection.selected }))
    })
    // this.vars.filter
    // this.table?.renderRows()
    // this.vars._updateChangeSubscription()
    // this.selectedGroup$.subscribe((group) => {
    //   if (group) {
    //     // this.store.dispatch(variableRemoveFromSelectGroup({ groupID: group, variableIDs: this.selection.selected }))
    //     console.log(group)
    //   }
    // })
  }

  getLabel(option: any) {
    return option.labl || "<ERROR: NO LABEL>"
  }

  // FILTER
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // console.log(filterValue)
    this.vars.filter = filterValue.trim().toLowerCase();

    if (this.vars.paginator) {
      this.vars.paginator.firstPage();
    }
  }

  // SELECT (CHECKBOX)
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

    const idsToAdd = this.vars.data.map((item: any) => item['@_ID']);
    this.selection.select(...idsToAdd);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  // MODAL
  setHeading(value: any) {
    const name = value['@_name'] || '';
    const label = value['labl']['#text'] || 'No Label';
    this.heading = `${name}: ${label}`;
  }

  viewChart(value: any) {
    this.store.dispatch(
      variableViewChart({ id: value['@_ID'] })
    );
    this.setHeading(value);
    this.modalComponent?.openModal();
  }

  close() {
    this.modalComponent?.closeModal();
  }

  editVar(value: any) {
    this.store.dispatch(variableViewDetail({ id: value['@_ID'] }));
    this.setHeading(value);
    this.modalComponent?.openModal();
  }
}
