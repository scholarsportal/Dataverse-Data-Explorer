import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dct-table-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-nav.component.html',
  styleUrl: './table-nav.component.css',
})
export class TableNavComponent {
  @Input() limit: number = 10;
  @Input() offset: number = 0;

  @Output() limitChange = new EventEmitter<number>();
  @Output() pagePreviousClick = new EventEmitter<void>();
  @Output() pageNextClick = new EventEmitter<void>();

  pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

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
