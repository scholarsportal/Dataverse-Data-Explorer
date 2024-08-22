import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
} from '../../new.state/xml/xml.selectors';
import {
  selectBodyToggleState,
  selectCrossTabSelection,
  selectCurrentGroupID,
  selectImportComponentState,
  selectOpenVariableCategoriesMissing,
  selectOpenVariableID,
  selectVariableSelectionContext,
} from '../../new.state/ui/ui.selectors';
import { Variable } from '../../new.state/xml/xml.interface';
import { SidebarComponent } from './variables/sidebar/sidebar.component';
import { DataComponent } from './variables/data/data.component';
import { CrossTabulationComponent } from './cross-tabulation/cross-tabulation.component';
import { ImportComponent } from '../import/import.component';
import {
  selectDatasetVariableCrossTabValues,
  selectDatasetWeights,
  selectVariableCrossTabIsFetching,
} from '../../new.state/dataset/dataset.selectors';
import { TableComponent } from './variables/data/table/table.component';

@Component({
  selector: 'dct-body',
  standalone: true,
  imports: [
    SidebarComponent,
    DataComponent,
    CrossTabulationComponent,
    ImportComponent,
    TableComponent,
  ],
  templateUrl: './body.component.html',
  styleUrl: './body.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent {
  store = inject(Store);

  variablesInCrossTab = this.store.selectSignal(selectCrossTabSelection);
  crossTabValuesFetched = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  crossTabIsFetching = this.store.selectSignal(
    selectVariableCrossTabIsFetching,
  );
  bodyToggleState = this.store.selectSignal(selectBodyToggleState);
  crossTabulationTabOpen = computed(() => {
    return this.bodyToggleState() === 'cross-tab';
  });
  variablesTabOpen = computed(() => {
    return this.bodyToggleState() === 'variables';
  });

  variablesWithCrossTabMetadata = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );

  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  allWeights = this.store.selectSignal(selectDatasetWeights);
  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  groupIDChanged = computed(() => {
    return this.selectedGroupID();
  });
  selectedVariableContext = this.store.selectSignal(
    selectVariableSelectionContext,
  );
  selectedVariables = computed(() => {
    return this.selectedVariableContext()[this.selectedGroupID()] || [];
  });
  categoriesMissing = this.store.selectSignal(
    selectOpenVariableCategoriesMissing,
  );
  openVariable = this.store.selectSignal(selectOpenVariableID);
  importComponentState = this.store.selectSignal(selectImportComponentState);

  // When groupID changes or user selects group, we filter the variables passed to the datatables component
  filteredByGroupID = computed(() => {
    if (this.selectedGroupID() === 'ALL') {
      return this.variables();
    } else {
      const filteredVariables: { [variableID: string]: Variable } = {};
      if (this.groups()[this.selectedGroupID()]) {
        if (!!this.groups()[this.selectedGroupID()]['@_var']) {
          const selectedGroupVariableArray =
            this.groups()[this.selectedGroupID()]['@_var']?.split(' ') || [];
          selectedGroupVariableArray.map((variableID) => {
            filteredVariables[variableID] = this.variables()[variableID];
          });
        }
      }
      return filteredVariables;
    }
  });
}
