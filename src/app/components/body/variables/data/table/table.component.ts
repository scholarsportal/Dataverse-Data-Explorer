import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalComponent } from './modal/modal.component';
import { BulkEditModalComponent } from './bulk-edit-modal/bulk-edit-modal.component';
import { KeyValuePipe, NgClass } from '@angular/common';
import { VariablesSimplified } from 'src/app/new.state/xml/xml.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { VariableOptionsButtonComponent } from './variable-options-button.component';
import { TableNavComponent } from '../table-nav/table-nav.component';

@Component({
  selector: 'dct-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BulkEditModalComponent,
    VariableOptionsButtonComponent,
    KeyValuePipe,
    TableModule,
    ButtonModule,
    TableNavComponent,
    ModalComponent,
    NgClass
  ]
})
export class TableComponent {
  store = inject(Store);
  ModalComponent = viewChild(ModalComponent);
  groupChanged = input.required<string>();
  variables = input.required<VariablesSimplified[]>();
  categoriesInvalid = input.required<any>();
  openVariable = input.required<string>();
  variableInCrossTab = input.required<boolean>();
  openVariableData = computed(() => {

    let next = '';
    let previous = '';
    let variable: VariablesSimplified | null = null;
    this.variables().map((variableData, index) => {
      if (variableData.variableID === this.openVariable()) {
        next = this.variables()[index + 1]?.variableID ?? '';
        previous = this.variables()[index - 1]?.variableID ?? '';
        variable = variableData;
      }
    });
    return { next, previous, variable };
  });
  selectedVariables = input.required<string[]>();
  currentPage = signal(0);
  itemsPerPage = signal(10);

  searchResult = signal<VariablesSimplified[]>([]);
  variablesResult = computed(() => {
    if (this.searchResult().length) {
      return this.searchResult();
    } else {
      return this.variables();
    }
  });
  variablesLength = computed(() => {
    return this.variablesResult().length;
  });

  isFirstPage = computed(() => {
    return this.currentPage() === 0;
  });
  isLastPage = computed(() => {
    return this.currentPage() + this.itemsPerPage() >= (this.variables().length - 1);
  });


  prev() {
    this.currentPage.set(this.currentPage() - this.itemsPerPage());
  }

  next() {
    this.currentPage.set(this.currentPage() + this.itemsPerPage());
  }

  start() {
    this.currentPage.set(0);
  }

  setItemsPerPage(itemsPerPage: number) {
    this.itemsPerPage.set(itemsPerPage);
  }

  setSearchResultList(value: VariablesSimplified[]) {
    this.searchResult.set(value);
  }

  setSelected(selection: string) {
    if (this.selectedVariables().includes(selection)) {
      const totalSelection = this.selectedVariables().filter(variableID => variableID !== selection);
      this.store.dispatch(VariableTabUIAction.changeVariableSelectionContext({
        selectedGroup: this.groupChanged(),
        variableIDs: totalSelection
      }));
    } else {
      const totalSelection = [selection, ...this.selectedVariables()];
      this.store.dispatch(VariableTabUIAction.changeVariableSelectionContext({
        selectedGroup: this.groupChanged(),
        variableIDs: totalSelection
      }));
    }
  }

  launchModal(value: { mode: 'view' | 'edit', variableID: string }) {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable(value));
    this.ModalComponent()?.open();
  }

}

