import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  selectCurrentGroup,
  selectVariableWeights,
} from 'src/app/state/selectors/var-groups.selectors';
import { MultiselectDropdownComponent } from '../multiselect-dropdown/multiselect-dropdown.component';
import { Variable, VariableGroup } from 'src/app/state/interface';
import {
  bulkChangeGroupsAndWeight,
  removeSelectedVariablesFromGroup,
} from 'src/app/state/actions/var-and-groups.actions';

@Component({
  selector: 'dct-table-menu',
  standalone: true,
  imports: [CommonModule, MultiselectDropdownComponent],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css',
})
export class TableMenuComponent {
  @Input() selectedVariables!: Variable[];
  weights$ = this.store.select(selectVariableWeights);
  selectedVariableGroup$ = this.store.select(selectCurrentGroup);
  selectedWeight: string = '';
  selectedGroups: VariableGroup[] = [];

  constructor(private store: Store) {}

  onRemoveFromGroup(groupID: string) {
    const variableIDs: string[] = [];
    this.selectedVariables.map((variable) =>
      variableIDs.push(variable['@_ID']),
    );
    this.store.dispatch(
      removeSelectedVariablesFromGroup({ variableIDs, groupID }),
    );
  }

  onSelectedWeightChange(weight: any) {
    if (weight.value) {
      this.selectedWeight = weight.value;
    }
    console.log(this.selectedWeight);
  }

  onGroupChange(groups: VariableGroup[]) {
    this.selectedGroups = groups;
  }

  onApplyChanges() {
    if (this.selectedVariables.length) {
      const groups: VariableGroup[] = JSON.parse(
        JSON.stringify(this.selectedGroups),
      );
      const newGroups: { [id: string]: VariableGroup } = {};
      const variables: Variable[] = JSON.parse(
        JSON.stringify(this.selectedVariables),
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
      console.log(groups);
      this.store.dispatch(
        bulkChangeGroupsAndWeight({
          groups: newGroups,
          variables: newVariables,
        }),
      );
    }
  }
}
