import { Component, computed, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
// import { selectCurrentGroup, selectVariableWeights } from 'src/app/state/selectors/var-groups.selectors';
import {
  Variable,
  VariableGroup,
} from '../../../../../new.state/xml/xml.interface';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { MultiselectDropdownComponent } from '../table/multiselect-dropdown/multiselect-dropdown.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { XmlManipulationActions } from '../../../../../new.state/xml/xml.actions';
import { BulkEditModalComponent } from '../table/bulk-edit-modal/bulk-edit-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { selectCrossTabSelection } from 'src/app/new.state/ui/ui.selectors';
import { selectDatasetVariableCrossTabValues } from 'src/app/new.state/dataset/dataset.selectors';
// import { Variable, VariableGroup } from 'src/app/state/interface';
// import {
//   bulkChangeGroupsAndWeight,
//   removeSelectedVariablesFromGroup
// } from 'src/app/state/actions/var-and-groups.actions';

@Component({
  selector: 'dct-table-menu',
  standalone: true,
  imports: [
    CommonModule,
    MultiSelectModule,
    DropdownModule,
    ChipModule,
    FormsModule,
    BulkEditModalComponent,
    TranslateModule,
  ],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css',
})
export class TableMenuComponent {
  store = inject(Store);
  selectedVariables = input.required<string[]>();

  variablesSelected = computed(() => {
    if (this.selectedVariables().length > 0) {
      return false;
    } else {
      return true;
    }
  });

  groupID = input.required<string>();
  selectedWeight: string = '';
  selectedGroups: string[] = [];
  allVariables = input.required<{ [variableID: string]: Variable }>();
  variablesWithCrossTabMetadata = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  variablesInCrossTab = this.store.selectSignal(selectCrossTabSelection);
  weights = input.required<{ [weightID: string]: string }>();
  allGroups = input.required<{ [id: string]: VariableGroup }>();
  allGroupsArray = computed(() => {
    return Object.keys(this.allGroups());
  });
  saved: boolean = false;
  error: boolean = false;

  constructor() {
    effect(() => {});
  }

  onRemoveFromGroup(groupID: string) {
    this.store.dispatch(
      XmlManipulationActions.removeVariablesFromGroup({
        groupID,
        variableIDs: this.selectedVariables(),
      }),
    );
    this.saved = true;
    setTimeout(() => {
      this.closeLoadedToast();
    }, 5000);
  }

  onSelectedWeightChange(weight: any) {
    this.selectedWeight = weight.value;
  }

  changeGroup(change: MultiSelectChangeEvent) {
    if (change.value) {
      this.selectedGroups = change.value;
    }
  }

  onApplyChanges() {
    if (this.selectedGroups.length > 0 || this.selectedWeight) {
      this.store.dispatch(
        XmlManipulationActions.bulkSaveWeightAndGroupChange({
          variableIDs: this.selectedVariables(),
          allVariables: this.allVariables(),
          groupsToUpdate: this.selectedGroups,
          weightToUpdate: this.selectedWeight,
          allGroups: this.allGroups(),
          crossTabMetadata: this.variablesWithCrossTabMetadata(),
        }),
      );
      this.saved = true;
      setTimeout(() => {
        this.closeLoadedToast();
      }, 5000);
    } else {
      this.error = true;
      setTimeout(() => {
        this.closeLoadedToast();
      }, 5000);
    }
  }

  closeLoadedToast() {
    this.saved = false;
    this.error = false;
  }
}
