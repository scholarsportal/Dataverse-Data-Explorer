import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DdeVariable } from '@dde/models';
import { TableNavComponent } from './table-nav';
import { TableMenuComponent } from './table-menu';

@Component({
  selector: 'dde-variable-table',
  standalone: true,
  imports: [TableNavComponent, TableMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'region', 'aria-label': 'Variable table' },
  template: `
    <dde-table-nav
      class="table-nav"
      [totalItems]="filteredVariables().length"
      [currentPage]="currentPage()"
      [itemsPerPage]="itemsPerPage()"
      (searchChanged)="onSearch($event)"
      (pageChanged)="currentPage.set($event)"
      (itemsPerPageChanged)="onItemsPerPageChange($event)"
    />

    <div class="table-container">
      <table>
        <!-- <thead>
          <tr>
            @if (hasEditPermission()) {
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  [checked]="allSelected()"
                  (change)="toggleAll()"
                />
              </th>
            }
            <th>ID</th>
            <th>Name</th>
            <th>Label</th>
            <th>Weight</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          @for (variable of pagedVariables(); track variable.id) {
            <tr (click)="viewVariable.emit(variable.id)">
              @if (hasEditPermission()) {
                <td class="checkbox-col" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    [checked]="selectedIds().has(variable.id)"
                    (change)="toggleSelection(variable.id)"
                  />
                </td>
              }
              <td>{{ variable.id }}</td>
              <td>{{ variable.name }}</td>
              <td>{{ variable.label }}</td>
              <td>
                @if (variable.isWeight) {
                  <span class="badge weight">Weight</span>
                } @else if (variable.assignedWeightId) {
                  <span class="badge assigned">{{ variable.assignedWeightId }}</span>
                } @else {
                  <span class="badge none">No weight</span>
                }
              </td>
              <td>
                <button class="options-btn" (click)="$event.stopPropagation(); viewVariable.emit(variable.id)">
                  View
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="hasEditPermission() ? 6 : 5" class="empty-row">
                No variables found
              </td>
            </tr>
          }
        </tbody> -->
      </table>
    </div>

    <dde-table-menu
      class="table-menu"
      [selectedCount]="selectedIds().size"
      (applyClicked)="bulkApply.emit()"
      (removeFromGroupClicked)="removeFromGroup.emit()"
    />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-template-rows: repeat(12, 1fr);
    }
    .table-nav {
      grid-area: 1 / 1 / 2 / 13;
    }
    .table-container {
      grid-area: 2 / 1 / 12 / 13;
      overflow: auto;
    }
    .table-menu {
      grid-area: 12 / 1 / 13 / 13;
    }
  `,
})
export class VariableTableComponent {
  variables = input<DdeVariable[]>([]);
  hasEditPermission = input(false);

  viewVariable = output<string>();
  bulkApply = output<void>();
  removeFromGroup = output<void>();

  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);
  selectedIds = signal(new Set<string>());

  filteredVariables = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.variables();
    return this.variables().filter(
      (v) =>
        v.id.toLowerCase().includes(term) ||
        v.name.toLowerCase().includes(term) ||
        v.label.toLowerCase().includes(term),
    );
  });

  pagedVariables = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredVariables().slice(start, start + this.itemsPerPage());
  });

  allSelected = computed(() => {
    const paged = this.pagedVariables();
    return paged.length > 0 && paged.every((v) => this.selectedIds().has(v.id));
  });

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onItemsPerPageChange(size: number) {
    this.itemsPerPage.set(size);
    this.currentPage.set(1);
  }

  toggleSelection(id: string) {
    const ids = new Set(this.selectedIds());
    if (ids.has(id)) {
      ids.delete(id);
    } else {
      ids.add(id);
    }
    this.selectedIds.set(ids);
  }

  toggleAll() {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.pagedVariables().map((v) => v.id)));
    }
  }
}
