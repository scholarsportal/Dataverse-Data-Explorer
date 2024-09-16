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
    MultiselectDropdownComponent,
    MultiSelectModule,
    DropdownModule,
    ChipModule,
    FormsModule,
    BulkEditModalComponent,
  ],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css',
})
export class TableMenuComponent {
  store = inject(Store);
  selectedVariables = input.required<string[]>();
  
  variablesSelected =  computed(() => {
    if (this.selectedVariables().length > 0) {
      return false
    } else {
      return true
    }
  });
  
  groupID = input.required<string>();
  selectedWeight: string = '';
  selectedGroups: string[] = [];
  allVariables = input.required<{ [variableID: string]: Variable }>();
  variablesWithCrossTabMetadata = input.required<{
    [variableID: string]: string[];
  }>();
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
        XmlManipulationActions.bulkSaveVariableInfo({
          variableIDs: this.selectedVariables(),
          assignedWeight: this.selectedWeight,
          groups: this.selectedGroups,
          allVariables: this.allVariables(),
          variablesWithCrossTabMetadata: this.variablesWithCrossTabMetadata(),
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
