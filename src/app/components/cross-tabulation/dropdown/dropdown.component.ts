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

@Component({
  selector: 'dct-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  constructor() {
    effect(() => {
      const selected = this.$selectedGroupVariables();
    });
  }
  store = inject(Store);
  type = input.required();
  $groups = this.store.selectSignal(selectDatasetVariableGroups);
  $variables = this.store.selectSignal(selectAvailableVariables);
  $selectedGroupVariables = signal<string | null>(null);
  $selectedVariable = signal<Variable | null>(null);

  $filteredVariables = computed(() => {
    if (this.$selectedGroupVariables()) {
      console.log(this.$selectedGroupVariables());
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

  onGroupChange(event: Event) {
    const value: string | null =
      (event?.target as HTMLSelectElement).value || null;
    console.log(value);

    if (value && value !== 'all') {
      this.$selectedGroupVariables.set(value);
    } else if (value === 'all') {
      this.$selectedGroupVariables.set(null);
    }
  }
}
