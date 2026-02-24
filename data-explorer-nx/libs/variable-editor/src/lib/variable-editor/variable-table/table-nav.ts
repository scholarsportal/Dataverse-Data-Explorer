import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dde-table-nav',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nav-bar">
      <input
        type="search"
        placeholder="Search variables..."
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearch($event)"
        class="search-input"
      />

      <div class="pagination">
        <select
          [ngModel]="itemsPerPage()"
          (ngModelChange)="itemsPerPageChanged.emit($event)"
          class="per-page"
        >
          @for (opt of pageSizeOptions; track opt) {
            <option [value]="opt">{{ opt }}</option>
          }
        </select>

        <span class="page-info">
          {{ rangeStart() }}-{{ rangeEnd() }} of {{ totalItems() }}
        </span>

        <button
          [disabled]="currentPage() <= 1"
          (click)="pageChanged.emit(currentPage() - 1)"
        >
          &lsaquo;
        </button>
        <button
          [disabled]="currentPage() >= totalPages()"
          (click)="pageChanged.emit(currentPage() + 1)"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  `,
  styles: `
    .nav-bar {
      display: flex;
      justify-content: space-between;
      height: 100%;
      padding: var(--md-sys-spacing-md) var(--md-sys-spacing-md);
      border-block-end: 1px solid #e0e0e0;
    }
    .search-input {
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      padding: 0 var(--md-sys-spacing-md);
      border-radius: 4px;
      min-width: 200px;
    }
    .pagination {
      display: flex;
      align-items: center;
      gap: var(--md-sys-spacing-sm, 8px);
    }
    .per-page {
      padding: var(--md-sys-spacing-xs, 4px);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
    }
    .page-info {
      font-size: 0.875rem;
      color: var(--md-sys-color-outline, #787680);
    }
    button {
      padding: var(--md-sys-spacing-xs, 4px) var(--md-sys-spacing-sm, 8px);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `,
})
export class TableNavComponent {
  totalItems = input(0);
  currentPage = input(1);
  itemsPerPage = input(10);

  searchChanged = output<string>();
  pageChanged = output<number>();
  itemsPerPageChanged = output<number>();

  pageSizeOptions = [10, 25, 50, 100];
  searchTerm = signal('');

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())),
  );

  rangeStart = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    return Math.min(start, this.totalItems());
  });

  rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()),
  );

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.searchChanged.emit(term);
  }
}
