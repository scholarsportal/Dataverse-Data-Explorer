import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectVariableWeights } from 'src/app/state/selectors/var-groups.selectors';
import { MultiselectDropdownComponent } from '../multiselect-dropdown/multiselect-dropdown.component';
import { Variable, VariableGroup } from 'src/app/state/interface';
import { bulkChangeGroupsAndWeight } from 'src/app/state/actions/var-and-groups.actions';

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
  selectedWeight: string = '';
  selectedGroups: VariableGroup[] = [];

  constructor(private store: Store) {}

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
    if (this.selectedGroups.length && this.selectedVariables.length) {
      const groups: VariableGroup[] = JSON.parse(
        JSON.stringify(this.selectedGroups)
      );
      this.store.dispatch(
        bulkChangeGroupsAndWeight({
          groups: this.selectedGroups,
          weight: this.selectedWeight,
        })
      );
    }
  }
}
