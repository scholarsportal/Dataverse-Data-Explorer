import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariablesSimplified } from '../../../../../new.state/xml/xml.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-table-nav',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-nav.component.html',
  styleUrl: './table-nav.component.css'
})
export class TableNavComponent {
  groupChanged = input.required<string>();
  searchValue = '';
  total = input.required<number>();
  limitChange = output<number>();
  pagePreviousClick = output();
  pageNextClick = output();

  variablesList = input.required<VariablesSimplified[]>();
  resultList = output<VariablesSimplified[]>();

  limit = signal(10);

  pageLimitOptions = [
    { value: 10 },
    { value: 25 },
    { value: 50 }
  ];

  constructor() {
    effect(() => {
      if (this.groupChanged().length) {
        this.searchValue = '';
        this.search();
      }
    });
  }

  search() {
    const newList = this.variablesList().filter(e => {
      const entries = Object.entries(e);
      return entries.some(entry => entry[1] ? entry[1].toString().toLowerCase().includes(this.searchValue.toLowerCase()) : false);
    });

    this.resultList.emit(newList);
  }

  onItemsPerPageChange(event: any) {
    const selectedValue = parseInt(event.target.value, 10);
    this.limitChange.emit(selectedValue);
  }

  pagePrevious() {
    this.pagePreviousClick.emit();
  }

  pageNext() {
    this.pageNextClick.emit();
  }
}
