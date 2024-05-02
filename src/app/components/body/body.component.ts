import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDatasetProcessedGroups, selectDatasetProcessedVariables } from '../../new.state/xml/xml.selectors';
import {
  selectBodyToggleState,
  selectCurrentGroupID,
  selectImportComponentState,
  selectOpenVariableCategoriesMissing,
  selectOpenVariableID,
  selectVariableSelectionContext
} from '../../new.state/ui/ui.selectors';
import { Variable } from '../../new.state/xml/xml.interface';
import { SidebarComponent } from './variables/sidebar/sidebar.component';
import { DataComponent } from './variables/data/data.component';
import { CrossTabulationComponent } from './cross-tabulation/cross-tabulation.component';
import { ImportComponent } from '../import/import.component';
import { TableComponent } from './variables/table/table.component';

@Component({
  selector: 'dct-body',
  standalone: true,
  imports: [
    SidebarComponent,
    DataComponent,
    CrossTabulationComponent,
    ImportComponent,
    TableComponent
  ],
  templateUrl: './body.component.html',
  styleUrl: './body.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent {
  store = inject(Store);

  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  groupIDChanged = computed(() => {
    return this.selectedGroupID();
  });
  selectedVariableContext = this.store.selectSignal(selectVariableSelectionContext);
  selectedVariables = computed(() => {
    return this.selectedVariableContext()[this.selectedGroupID()] || [];
  });
  categoriesMissing = this.store.selectSignal(selectOpenVariableCategoriesMissing);
  openVariable = this.store.selectSignal(selectOpenVariableID);
  importComponentState = this.store.selectSignal(selectImportComponentState);

  bodyToggleState = this.store.selectSignal(selectBodyToggleState);
  crossTabulationTabOpen = computed(() => {
    return this.bodyToggleState() === 'cross-tab';
  });
  variablesTabOpen = computed(() => {
    return this.bodyToggleState() === 'variables';
  });

  // When groupID changes or user selects group, we filter the variables passed to the datatables component
  filteredByGroupID = computed(() => {
    if (this.selectedGroupID() === 'ALL') {
      return this.variables();
    } else {
      const filteredVariables: { [variableID: string]: Variable } = {};
      if (this.groups()[this.selectedGroupID()]) {
        this.groups()[this.selectedGroupID()]['@_var']?.split(' ').map(variableID => {
          filteredVariables[variableID] = this.variables()[variableID];
        });
      }
      return filteredVariables;
    }
  });
}
