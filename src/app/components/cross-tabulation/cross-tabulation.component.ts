import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable, VariableGroup } from 'src/app/state/interface';
import { DropdownComponent } from './dropdown/dropdown.component';
import { Store } from '@ngrx/store';
import {
  selectDatasetVariableGroups,
  selectDatasetVariables,
} from 'src/app/state/selectors/dataset.selectors';

@Component({
  selector: 'dct-cross-tabulation',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  templateUrl: './cross-tabulation.component.html',
  styleUrl: './cross-tabulation.component.css',
})
export class CrossTabulationComponent {
  groups$ = this.store.select(selectDatasetVariableGroups);
  variables$ = this.store.select(selectDatasetVariables);

  constructor(private store: Store) {}
}
