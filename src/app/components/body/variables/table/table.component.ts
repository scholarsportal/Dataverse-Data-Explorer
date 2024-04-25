import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxDatatableModule, SelectionType, SortType } from '@swimlane/ngx-datatable';
import { ModalComponent } from './modal/modal.component';
import { TableMenuComponent } from './table-menu/table-menu.component';
import { VariableOptionsComponent } from './variable-options/variable-options.component';
import { BulkEditModalComponent } from './bulk-edit-modal/bulk-edit-modal.component';
import { KeyValuePipe, NgClass } from '@angular/common';
import { TableNavComponent } from './table-nav/table-nav.component';
import { Variable } from '../../../../new.state/xml/xml.interface';

@Component({
  selector: 'dct-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableNavComponent,
    NgClass,
    NgxDatatableModule,
    BulkEditModalComponent,
    VariableOptionsComponent,
    TableMenuComponent,
    KeyValuePipe
  ]
})
export class TableComponent {
  store = inject(Store);
  table = viewChild('table');
  ModalComponent = viewChild(ModalComponent);
  variables = input.required<{ [variableID: string]: Variable }>();

  columns = [
    { name: 'check' },
    { name: 'ID' },
    { name: 'Name' },
    { name: 'Label' },
    { name: 'Weight' },
    { name: 'View/Edit' }
  ];

  SortType = SortType;
  SelectionType = SelectionType;

}
