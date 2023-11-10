import {
  Component,
  Input,
  OnChanges,
  OnInit,
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

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnChanges, OnInit {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;

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
        this.vars$ = Object.values(data);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const openGroup = changes['openGroup'];
    if (openGroup.previousValue !== openGroup.currentValue) {
      this.store.select(selectGroupVariables).subscribe((data: any) => {
        this.vars$ = data;
      });
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

  close() {
    this.modalComponent?.closeModal();
  }
}