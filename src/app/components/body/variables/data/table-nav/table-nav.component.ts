import { Component, computed, effect, input, output } from '@angular/core';
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
  searchTerm = '';

  groupChanged = input.required<string>();

  variablesList = input.required<VariablesSimplified[]>();
  total = input.required<number>();

  itemsPerPage = input.required<number>();
  currentPage = input.required<number>();
  isLastPage = input.required<boolean>();
  isFirstPage = input.required<boolean>();
  indexRange = computed(() => {
    if (this.total() === 1) {
      return '1 variable';
    } else {
      return `${this.currentPage() + 1} - ${this.currentPage() + this.itemsPerPage()} of ${this.total()} variables`;
    }
  });

  emitItemsPerPageChange = output<number>();
  pagePreviousClick = output();
  pageNextClick = output();

  emitSearchResultList = output<VariablesSimplified[]>();

  pageLimitOptions = [
    { value: 10 },
    { value: 25 },
    { value: 50 }
  ];

  constructor() {
    effect(() => {
      if (this.groupChanged().length) {
        this.searchTerm = '';
        this.search();
      }
    });
  }

  search() {
    const newList = this.variablesList().filter(e => {
      const entries = Object.entries(e);
      return entries.some(entry => entry[1] ? entry[1].toString().toLowerCase().includes(this.searchTerm.toLowerCase()) : false);
    });

    this.emitSearchResultList.emit(newList);
  }

  onItemsPerPageChange(event: any) {
    const selectedValue = parseInt(event.target.value, 10);
    this.emitItemsPerPageChange.emit(selectedValue);
  }

  pagePrevious() {
    this.pagePreviousClick.emit();
  }

  pageNext() {
    this.pageNextClick.emit();
  }
}
