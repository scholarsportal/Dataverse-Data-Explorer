import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
// import { selectCurrentGroup, selectVariableWeights } from 'src/app/state/selectors/var-groups.selectors';
import { MultiselectDropdownComponent } from '../multiselect-dropdown/multiselect-dropdown.component';
import { Variable } from 'src/app/new.state/xml/xml.interface';
import { selectCurrentGroupID } from 'src/app/new.state/ui/ui.selectors';
import { selectDatasetWeights } from 'src/app/new.state/dataset/dataset.selectors';
import { selectDatasetProcessedGroups } from 'src/app/new.state/xml/xml.selectors';
// import { Variable, VariableGroup } from 'src/app/state/interface';
// import {
//   bulkChangeGroupsAndWeight,
//   removeSelectedVariablesFromGroup
// } from 'src/app/state/actions/var-and-groups.actions';

@Component({
  selector: 'dct-table-menu',
  standalone: true,
  imports: [CommonModule, MultiselectDropdownComponent],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css'
})
export class TableMenuComponent {
  selectedVariables = input.required<Variable[]>();

  selectedWeight: string = '';

  weights = this.store.select(selectDatasetWeights);
  currentSelectedGroupID = this.store.select(selectCurrentGroupID);
  allGroups = this.store.selectSignal(selectDatasetProcessedGroups);

  allGroupsComputed = computed(() => {
    const values: { [id: string]: string } = {};
    Object.values(this.allGroups()).map((variableGroup) => {
      values[variableGroup['@_ID']] = variableGroup.labl;
    });
    return values;
  });
  selectedGroups = signal<string[]>([]);

  constructor(private store: Store) {
  }

  onRemoveFromGroup(groupID: string) {
    // const variableIDs: string[] = [];
    // this.selectedVariables.map((variable) =>
    //   variableIDs.push(variable['@_ID'])
    // );
    // this.store.dispatch(
    //   removeSelectedVariablesFromGroup({ variableIDs, groupID })
    // );
  }

  onSelectedWeightChange(weight: any) {
    if (weight.value) {
      this.selectedWeight = weight.value;
    }
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
