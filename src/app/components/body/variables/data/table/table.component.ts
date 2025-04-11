import {
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalComponent } from './modal/modal.component';
import {
  Variable,
  VariablesSimplified,
} from 'src/app/new.state/xml/xml.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { VariableOptionsButtonComponent } from './variable-options-button.component';
import { TableNavComponent } from '../table-nav/table-nav.component';
import { ChipsModule } from 'primeng/chips';
import { TableMenuComponent } from '../table-menu/table-menu.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
  selectUserHasUploadAccess,
} from 'src/app/new.state/xml/xml.selectors';
import {
  selectDatasetVariableCrossTabValues,
  selectDatasetWeights,
  selectVariableCrossTabIsFetching,
} from 'src/app/new.state/dataset/dataset.selectors';
import {
  selectCrossTabSelection,
  selectCurrentGroupID,
  selectOpenVariableCategoriesMissing,
  selectOpenVariableID,
  selectVariableSelectionContext,
} from 'src/app/new.state/ui/ui.selectors';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'dct-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  standalone: true,
  //changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VariableOptionsButtonComponent,
    TableModule,
    ButtonModule,
    TableNavComponent,
    TableMenuComponent,
    ModalComponent,
    ChipsModule,
    TranslateModule,
    CommonModule,
  ],
})
export class TableComponent {
  store = inject(Store);
  ModalComponent = viewChild(ModalComponent);
  hasApiKey = this.store.selectSignal(selectUserHasUploadAccess);
  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  weights = this.store.selectSignal(selectDatasetWeights);
  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  allVariables = this.store.selectSignal(selectDatasetProcessedVariables);
  processedVariables = this.store.selectSignal(selectDatasetProcessedVariables);
  selectedVariableContext = this.store.selectSignal(
    selectVariableSelectionContext,
  );
  selectedVariables = computed(() => {
    return this.selectedVariableContext()[this.selectedGroupID()] || [];
  });
  categoriesInvalid = this.store.selectSignal(
    selectOpenVariableCategoriesMissing,
  );
  openVariable = this.store.selectSignal(selectOpenVariableID);
  variablesInCrossTab = this.store.selectSignal(selectCrossTabSelection);
  isFetching = this.store.selectSignal(selectVariableCrossTabIsFetching);
  variablesSimplified = computed(() => {
    const simplified: VariablesSimplified[] = [];
    Object.values(this.selectedGroupVariables()).forEach((value) => {
      if (value?.['@_ID']) {
        const newObj = {
          variableID: value['@_ID'],
          name: value['@_name'],
          label: value.labl?.['#text'] || '',
          weight: value['@_wgt-var'] || '',
          isWeight: !!value['@_wgt'],
          selected: this.selectedVariables().includes(value['@_ID']),
        };
        simplified.push(newObj);
      }
    });
    return simplified;
  });
  selectedGroupVariables = computed(() => {
    if (this.selectedGroupID() === 'ALL') {
      return this.allVariables();
    } else {
      const filteredVariables: { [variableID: string]: Variable } = {};
      if (this.groups()[this.selectedGroupID()]) {
        const groupVariables = this.groups()[this.selectedGroupID()]['@_var'];
        if (groupVariables && groupVariables.length > 0) {
          const selectedGroupVariableArray = groupVariables.split(' ') || [];
          selectedGroupVariableArray.map((variableID) => {
            filteredVariables[variableID] = this.allVariables()[variableID];
          });
        }
      }
      return filteredVariables;
    }
  });
  openVariableData = computed(() => {
    let next = '';
    let previous = '';
    let variable: VariablesSimplified | null = null;
    this.variablesSimplified().map((variableData, index) => {
      if (variableData.variableID === this.openVariable()) {
        next = this.variablesSimplified()[index + 1]?.variableID ?? '';
        previous = this.variablesSimplified()[index - 1]?.variableID ?? '';
        variable = variableData;
      }
    });
    return { next, previous, variable };
  });
  allVariablesSelected = computed(() => {
    return (
      this.selectedVariables().length === this.variablesSimplified().length
    );
  });
  groupLabel = computed(() => {
    let label = 'ALL';
    const currentGroup = this.groups()[this.selectedGroupID()];
    if (currentGroup) {
      label = currentGroup.labl;
    }
    return label;
  });
  searchResult = signal<VariablesSimplified[]>([]);
  searchResultVariables = computed(() => {
    let txt1: string = '';
    let txt2: string = '';

    this.translate.get('TABLE_NAV.SHOWING').subscribe((res: string) => {
      txt1 = res;
    });
    this.translate.get('TABLE_NAV.BELOW').subscribe((res: string) => {
      txt2 = res;
    });

    if (this.searchResult().length > 0) {
      if (this.searchResult().length < this.variablesSimplified().length) {
        this.liveAnnouncer.announce(txt1 + this.searchResult().length + txt2);
      }
    }
    if (this.searchResult().length) {
      return this.searchResult();
    } else {
      return this.variablesSimplified();
    }
  });
  variablesLength = computed(() => {
    return this.searchResultVariables().length;
  });

  currentPage = 0;
  itemsPerPage = signal(10);

  constructor(
    private liveAnnouncer: LiveAnnouncer,
    private translate: TranslateService,
  ) {
    effect(() => {
      // group changed
      if (this.selectedGroupID()) {
        this.start();
      }
    });
  }

  isFirstPage = () => {
    return this.currentPage === 0;
  };

  isLastPage = () => {
    return (
      this.currentPage + this.itemsPerPage() >=
      this.variablesSimplified().length - 1
    );
  };

  toggleAll() {
    if (this.selectedVariables().length > 4) {
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.selectedGroupID(),
          variableIDs: [],
        }),
      );
    } else {
      const values: string[] = [];
      this.variablesSimplified().map((variable) => {
        values.push(variable.variableID);
      });
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.selectedGroupID(),
          variableIDs: values,
        }),
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
    if (this.itemsPerPage() === this.variablesSimplified().length) {
      this.currentPage = 0;
    }
  }

  setSearchResultList(value: VariablesSimplified[]) {
    this.searchResult.set(value);
  }

  setSelected(selection: string) {
    if (this.selectedVariables().includes(selection)) {
      const totalSelection = this.selectedVariables().filter(
        (variableID) => variableID !== selection,
      );
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.selectedGroupID(),
          variableIDs: totalSelection,
        }),
      );
    } else {
      const totalSelection = [selection, ...this.selectedVariables()];
      this.store.dispatch(
        VariableTabUIAction.changeVariableSelectionContext({
          selectedGroup: this.selectedGroupID(),
          variableIDs: totalSelection,
        }),
      );
    }
    setTimeout(() => document.getElementById(selection)?.focus(), 200);
  }

  launchModal(value: { mode: 'VIEW_VAR' | 'EDIT_VAR'; variableID: string }) {
    this.store.dispatch(VariableTabUIAction.changeOpenVariable(value));
    this.ModalComponent()?.open();
  }
}
