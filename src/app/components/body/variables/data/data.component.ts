import { Component, computed, inject, input } from '@angular/core';
import {
  Variable,
  VariableGroup,
  VariablesSimplified,
} from 'src/app/new.state/xml/xml.interface';
import { KeyValuePipe } from '@angular/common';
import { TableComponent } from './table/table.component';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
  selectUserHasUploadAccess,
} from 'src/app/new.state/xml/xml.selectors';
import { Store } from '@ngrx/store';
import {
  selectCrossTabSelection,
  selectCurrentGroupID,
  selectOpenVariableCategoriesMissing,
  selectOpenVariableID,
  selectVariableSelectionContext,
} from 'src/app/new.state/ui/ui.selectors';
import {
  selectDatasetVariableCrossTabValues,
  selectDatasetWeights,
  selectVariableCrossTabIsFetching,
} from 'src/app/new.state/dataset/dataset.selectors';

@Component({
  selector: 'dct-data',
  standalone: true,
  imports: [TableComponent],
  // templateUrl: './data.component.html',
  template: ` <dct-table class="md:flex flex-col w-full table" /> `,
  styleUrl: './data.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataComponent {
  store = inject(Store);
  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  allVariables = this.store.selectSignal(selectDatasetProcessedVariables);
  hasApiKey = this.store.selectSignal(selectUserHasUploadAccess);
  openVariable = this.store.selectSignal(selectOpenVariableID);
  selectedVariableContext = this.store.selectSignal(
    selectVariableSelectionContext,
  );
  selectedVariables = computed(() => {
    return this.selectedVariableContext()[this.selectedGroupID()] || [];
  });
  categoriesInvalid = this.store.selectSignal(
    selectOpenVariableCategoriesMissing,
  );
  variablesWithCrossTabMetadata = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  variablesInCrossTabSelection = this.store.selectSignal(
    selectCrossTabSelection,
  );
  isFetching = this.store.selectSignal(selectVariableCrossTabIsFetching);
  crossTabValuesFetched = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  weights = this.store.selectSignal(selectDatasetWeights);
  variables = computed(() => {
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
  variablesSimplified = computed(() => {
    const simplified: VariablesSimplified[] = [];
    Object.values(this.variables()).forEach((value) => {
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

  // This used to notify the search box that the user has changed the displayed
  // variables listed so the search box resets
  groupChanged = computed(() => {
    return this.selectedGroupID();
  });
}
