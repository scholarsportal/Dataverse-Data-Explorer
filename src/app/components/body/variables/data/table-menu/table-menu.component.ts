import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
// import { selectCurrentGroup, selectVariableWeights } from 'src/app/state/selectors/var-groups.selectors';
import { VariableGroup } from '../../../../../new.state/xml/xml.interface';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipsModule } from 'primeng/chips';
import { MultiselectDropdownComponent } from '../table/multiselect-dropdown/multiselect-dropdown.component';
import { FormsModule } from '@angular/forms';
// import { Variable, VariableGroup } from 'src/app/state/interface';
// import {
//   bulkChangeGroupsAndWeight,
//   removeSelectedVariablesFromGroup
// } from 'src/app/state/actions/var-and-groups.actions';

@Component({
  selector: 'dct-table-menu',
  standalone: true,
  imports: [CommonModule, MultiselectDropdownComponent, MultiSelectModule, ChipsModule, FormsModule],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css'
})
export class TableMenuComponent {
  store = inject(Store);
  selectedVariables = input.required<string[]>();
  groupID = input.required<string>();

  selectedWeight: string = '';

  weights = input.required<{ [weightID: string]: string }>();
  allGroups = input.required<{ [id: string]: VariableGroup }>();
  allGroupsComputed = computed(() => {
    const values: { [id: string]: string } = {};
    Object.values(this.allGroups()).map((variableGroup) => {
      values[variableGroup['@_ID']] = variableGroup.labl;
    });
    return values;
  });
  selectedGroups = signal<string[]>([]);

  constructor() {
    effect(() => {

    });
  }

  onRemoveFromGroup(groupID: string) {
    // this.store.dispatch(XmlManipulationActions.)
  }

  onSelectedWeightChange(weight: any) {
    if (weight.value) {
      this.selectedWeight = weight.value;
    }
  }

  logIT(trhing: any) {
    console.log(trhing);
  }

  onGroupChange(groups: string[]) {
    this.selectedGroups.set(groups);
  }

  onApplyChanges() {
    /*    if (this.selectedVariables.length) {
          const groups: VariableGroup[] = JSON.parse(
            JSON.stringify(this.selectedGroups)
          );
          const newGroups: { [id: string]: VariableGroup } = {};
          const variables: Variable[] = JSON.parse(
            JSON.stringify(this.selectedVariables)
          );
          const newVariables: { [id: string]: Variable } = {};
          const variableIDs: string[] = [];
          variables.map((variable) => {
            if (!(variable['@_wgt'] === 'wgt')) {
              variable['@_wgt-var'] = this.selectedWeight;
              variableIDs.push(variable['@_ID']);
            }
            newVariables[variable['@_ID']] = variable;
          });
          groups.map((variableGroup) => {
            const variablesInGroup: string[] = variableGroup['@_var'].split(' ');
            variables.map((variable): void => {
              if (!variablesInGroup.includes(variable['@_ID'])) {
                variablesInGroup.push(variable['@_ID']);
              }
            });
            variableGroup['@_var'] = variablesInGroup.join(' ');
            newGroups[variableGroup['@_ID']] = variableGroup;
          });
          this.store.dispatch(
            bulkChangeGroupsAndWeight({
              groups: newGroups,
              variables: newVariables
            })
          );
        }*/
  }
}
