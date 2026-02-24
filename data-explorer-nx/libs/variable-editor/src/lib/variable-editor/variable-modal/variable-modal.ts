import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { DdeVariable, DdeVariableGroup, CrossTabObservationData } from '@dde/models';
import { VariableViewComponent } from './variable-view';
import { VariableEditComponent } from './variable-edit';

type ModalMode = 'view' | 'edit';

@Component({
  selector: 'dde-variable-modal',
  standalone: true,
  imports: [VariableViewComponent, VariableEditComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (opened()) {
      <div class="backdrop" (click)="close()"></div>
      <dialog class="modal" [open]="opened()">
        <header class="modal-header">
          <div class="header-info">
            <span class="var-id">{{ variable()?.id }}</span>
            <span class="var-name">{{ variable()?.name }}</span>
          </div>

          <div class="header-actions">
            @if (mode() === 'view' && hasEditPermission()) {
              <button (click)="mode.set('edit')">Edit</button>
            } @else if (mode() === 'edit') {
              <button (click)="mode.set('view')">View</button>
            }

            <button (click)="navigated.emit('prev')" [disabled]="!hasPrev()">
              &lsaquo;
            </button>
            <button (click)="navigated.emit('next')" [disabled]="!hasNext()">
              &rsaquo;
            </button>
            <button class="close-btn" (click)="close()">&times;</button>
          </div>
        </header>

        <div class="modal-body">
          @if (mode() === 'view') {
            <dde-variable-view
              [variable]="variable()"
              [observationData]="observationData()"
            />
          } @else {
            <dde-variable-edit
              [variable]="variable()"
              [groups]="groups()"
              (saved)="variableSaved.emit($event)"
            />
          }
        </div>

        <footer class="modal-footer">
          <button (click)="close()">Close</button>
        </footer>
      </dialog>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 100;
    }
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      border: none;
      border-radius: 12px;
      padding: 0;
      width: min(90vw, 720px);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      background: var(--md-sys-color-surface, #fffbff);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--md-sys-spacing-md, 16px) var(--md-sys-spacing-lg, 24px);
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
    }
    .header-info {
      display: flex;
      gap: var(--md-sys-spacing-sm, 8px);
      align-items: baseline;
    }
    .var-id {
      font-size: 0.875rem;
      color: var(--md-sys-color-outline, #787680);
    }
    .var-name {
      font-weight: 500;
    }
    .header-actions {
      display: flex;
      gap: var(--md-sys-spacing-xs, 4px);
    }
    .header-actions button {
      padding: var(--md-sys-spacing-xs, 4px) var(--md-sys-spacing-sm, 8px);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
    .close-btn {
      font-size: 1.25rem;
      border: none !important;
    }
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--md-sys-spacing-lg, 24px);
    }
    .modal-footer {
      padding: var(--md-sys-spacing-md, 16px) var(--md-sys-spacing-lg, 24px);
      border-top: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      display: flex;
      justify-content: flex-end;
    }
    .modal-footer button {
      padding: var(--md-sys-spacing-sm, 8px) var(--md-sys-spacing-lg, 24px);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
  `,
})
export class VariableModalComponent {
  variable = input<DdeVariable | null>(null);
  groups = input<DdeVariableGroup[]>([]);
  observationData = input<CrossTabObservationData>({});
  hasEditPermission = input(false);
  opened = input(false);
  hasPrev = input(false);
  hasNext = input(false);

  variableSaved = output<{
    changes: Partial<DdeVariable>;
    groupIds: string[];
  }>();
  closed = output<void>();
  navigated = output<'prev' | 'next'>();

  mode = signal<ModalMode>('view');

  close() {
    this.mode.set('view');
    this.closed.emit();
  }
}