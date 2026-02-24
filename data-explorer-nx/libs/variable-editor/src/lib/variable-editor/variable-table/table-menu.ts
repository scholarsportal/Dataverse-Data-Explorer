import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'dde-table-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="menu-bar">
      <span class="selection-count">
        {{ selectedCount() }} selected
      </span>

      <div class="actions">
        <button [disabled]="selectedCount() === 0" (click)="applyClicked.emit()">
          Apply
        </button>
        <button [disabled]="selectedCount() === 0" (click)="removeFromGroupClicked.emit()">
          Remove from Group
        </button>
      </div>
    </div>
  `,
  styles: `
    .menu-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--md-sys-spacing-sm, 8px) var(--md-sys-spacing-md, 16px);
      border-top: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      background: var(--md-sys-color-surface-variant, #f3f4f6);
    }
    .selection-count {
      font-size: 0.875rem;
      color: var(--md-sys-color-outline, #787680);
    }
    .actions {
      display: flex;
      gap: var(--md-sys-spacing-sm, 8px);
    }
    button {
      padding: var(--md-sys-spacing-sm, 8px) var(--md-sys-spacing-md, 16px);
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
export class TableMenuComponent {
  selectedCount = input(0);

  applyClicked = output<void>();
  removeFromGroupClicked = output<void>();
}