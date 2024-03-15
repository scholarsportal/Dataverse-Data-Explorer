import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
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
  @Input() type!: 'rows' | 'columns';
  @Input() index!: number;
  variableID: string | null = null;
  @Output() emitNewSelectedVariable: EventEmitter<{
    type: 'rows' | 'columns';
    index: number;
    variable: Variable;
  }> = new EventEmitter<{
    type: 'rows' | 'columns';
    index: number;
    variable: Variable;
  }>();

  filteredVariables: Variable[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.filteredVariables = Object.values(this.variables || {});
    }
  }

  filterVariables(group: any | null) {
    if (group?.value) {
      const newGroup = group.value as string;
      if (!newGroup) {
        this.filteredVariables = Object.values(this.variables || {});
      }
      if (newGroup) {
        const newVariableList: Variable[] = [];
        newGroup.split(' ').map((variableID: string) => {
          newVariableList.push(this.variables![variableID]);
        });
        this.filteredVariables = newVariableList;
      }
    }
  }

  handleVariableSelect(variable: any) {
    this.emitNewSelectedVariable.emit({
      type: this.type,
      index: this.index,
      variable: this.variables![variable.value],
    });
  }
}
