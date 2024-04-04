import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable, VariableGroup } from 'src/app/state/interface';
import { FormsModule } from '@angular/forms';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import { Store } from '@ngrx/store';
import { selectAvailableVariables } from 'src/app/state/selectors/cross-tabulation.selectors';
import { changeVariableInGivenPosition } from 'src/app/state/actions/cross-tabulation.actions';
import { MultiselectDropdownComponent } from '../../table/multiselect-dropdown/multiselect-dropdown.component';

@Component({
  selector: 'dct-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiselectDropdownComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  store = inject(Store);
  $type = input.required<'rows' | 'columns'>();
  $selectedVariable = input.required<string>();
  $allSelectedVariables =
    input.required<{ variableID: string; missingCategories: string[] }[]>();
  $index = input.required<number>();
  $groups = this.store.selectSignal(selectDatasetVariableGroups);
  $variables = this.store.selectSignal(selectAvailableVariables);
  $selectedGroupVariables = signal<string | null>(null);

  constructor() {
    effect(() => {
      // console.log(this.$selectedVariable());
      // console.log(this.$type());
    });
  }

  $variablesAlreadySelected = computed(() => {
    const variableList: string[] = [];
    this.$allSelectedVariables().map((variableData) => {
      variableList.push(variableData.variableID);
    });
    return variableList;
  });

  $filteredVariables = computed(() => {
    if (this.$selectedGroupVariables()) {
      const newVariables: Variable[] = [];
      this.$selectedGroupVariables()
        ?.split(' ')
        .map((variableID: string) =>
          newVariables.push(this.$variables()[variableID]),
        );
      return newVariables;
    } else {
      return Object.values(this.$variables());
    }
  });

  $allCategoryValues = computed((): { [id: string | number]: string } => {
    return {};
  });

  $selectedCategoryValues = computed((): string[] => {
    return [];
  });

  onChangeCategoriesSelected(newCategoryList: string[]) {
    console.log(newCategoryList);
  }

  checkVariableSelected(variableID: string): boolean {
    return (
      this.$variablesAlreadySelected().includes(variableID) &&
      this.$selectedVariable() !== variableID
    );
  }

  onGroupChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value && value !== 'all') {
      this.$selectedGroupVariables.set(value);
    } else if (value === 'all') {
      this.$selectedGroupVariables.set(null);
    }
  }

  onVariableChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    if (value) {
      this.store.dispatch(
        changeVariableInGivenPosition({
          index: this.$index(),
          variableType: this.$type(),
          variableID: value,
        }),
      );
    }
  }
}
