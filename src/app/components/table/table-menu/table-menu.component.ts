import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectVariableWeights } from 'src/app/state/selectors/var-groups.selectors';
import { MultiselectDropdownComponent } from '../multiselect-dropdown/multiselect-dropdown.component';

@Component({
  selector: 'dct-table-menu',
  standalone: true,
  imports: [CommonModule, MultiselectDropdownComponent],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css',
})
export class TableMenuComponent implements OnInit {
  weights$ = this.store.select(selectVariableWeights);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.weights$.subscribe((data) => {
      console.log(data);
    });
  }
}
