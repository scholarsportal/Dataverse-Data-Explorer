import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable, VariableGroup } from 'src/app/state/interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent implements OnChanges {
  @Input() groups: VariableGroup[] | null | undefined = [];
  @Input() variables: { [id: string]: Variable } | null = {};

  selectedVariable: any = '';
  filteredVariables: Variable[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.filteredVariables = Object.values(this.variables || {});
    }
    console.log(this.filteredVariables);
  }

  filterVariables(group: any | null) {
    console.log(group);
    if (group.value === '') {
      this.filteredVariables = Object.values(this.variables || {});
    }
    if (group.value) {
      // this.filteredVariables = this.variables.filter(variable => variable)
      const newVariableList: Variable[] = [];
      console.log(group.value);
      group.value['@_var']
        .split(' ')
        .map((variableID: string) =>
          newVariableList.push(this.variables![variableID])
        );
      this.filteredVariables = newVariableList;
    }
  }
}
