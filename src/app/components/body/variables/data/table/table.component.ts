import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalComponent } from './modal/modal.component';
import { KeyValuePipe, NgClass } from '@angular/common';
import { VariableGroup, VariablesSimplified } from 'src/app/new.state/xml/xml.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { VariableOptionsButtonComponent } from './variable-options-button.component';
import { TableNavComponent } from '../table-nav/table-nav.component';
import { ChipsModule } from 'primeng/chips';
import { TableMenuComponent } from '../table-menu/table-menu.component';

@Component({
  selector: 'dct-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VariableOptionsButtonComponent,
    KeyValuePipe,
    TableModule,
    ButtonModule,
    TableNavComponent,
    TableMenuComponent,
    ModalComponent,
    NgClass,
    ChipsModule
  ]
})
export class TableComponent {
  store = inject(Store);
  ModalComponent = viewChild(ModalComponent);
  groupChanged = input.required<string>();
  variables = input.required<VariablesSimplified[]>();
  groups = input.required<{ [variableID: string]: VariableGroup }>();
  weights = input.required<{ [weightID: string]: string }>();
  categoriesInvalid = input.required<string[]>();
  openVariable = input.required<string>();
  variablesInCrossTab =
    input.required<
      { variableID: string; orientation: 'rows' | 'cols' | '' }[]
    >();
  isFetching = input.required<boolean>();
  crossTabValuesFetched = input.required<{ [variableID: string]: string[] }>();
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
  allVariablesSelected = computed(() => {
    return this.selectedVariables().length === this.variables().length;
  });
  searchResult = signal<VariablesSimplified[]>([]);
  searchResultVariables = computed(() => {
    if (this.searchResult().length) {
      return this.searchResult();
    } else {
      return this.variables();
    }
  });
  variablesLength = computed(() => {
    return this.searchResultVariables().length;
  });

  currentPage = 0;
  itemsPerPage = signal(10);

  constructor() {
    effect(() => {
      if (this.groupChanged()) {
        this.start();
      }
    });
  }

  isFirstPage = () => {
    return this.currentPage === 0;
  };

  isLastPage = () => {
    return (
      this.currentPage + this.itemsPerPage() >= this.variables().length - 1
    );
  };

  toggleAll() {
    if (this.selectedVariables().length > 4) {
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.groupChanged(),
          variableIDs: []
        })
      );
    } else {
      const values: string[] = [];
      this.variables().map((variable) => {
        values.push(variable.variableID);
      });
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.groupChanged(),
          variableIDs: values
        })
      );
    }
  }

  prev() {
    if (this.currentPage - this.itemsPerPage() <= 0) {
      this.currentPage = 0;
    } else {
      this.currentPage = this.currentPage - this.itemsPerPage();
    }
  }

  next() {
    this.currentPage = this.currentPage + this.itemsPerPage();
  }

  start() {
    this.currentPage = 0;
  }

  setItemsPerPage(itemsPerPage: number) {
    this.itemsPerPage.set(itemsPerPage);
  }

  setSearchResultList(value: VariablesSimplified[]) {
    this.searchResult.set(value);
  }

  setSelected(selection: string) {
    if (this.selectedVariables().includes(selection)) {
      const totalSelection = this.selectedVariables().filter(
        (variableID) => variableID !== selection
      );
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.groupChanged(),
          variableIDs: totalSelection
        })
      );
    } else {
      const totalSelection = [selection, ...this.selectedVariables()];
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.groupChanged(),
          variableIDs: totalSelection
        })
      );
    }
  }

  removeFromCrossTab(value: string) {
    // console.log(value);
  }

  launchModal(value: { mode: 'view' | 'edit'; variableID: string }) {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable(value));
    this.ModalComponent()?.open();
  }
}
