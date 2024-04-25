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
  @Input() total: number | undefined = undefined;

  @Output() limitChange = new EventEmitter<number>();
  @Output() pagePreviousClick = new EventEmitter<void>();
  @Output() pageNextClick = new EventEmitter<void>();

  pageLimitOptions = [
    { value: 100 },
    { value: 250 },
    { value: 500 },
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
