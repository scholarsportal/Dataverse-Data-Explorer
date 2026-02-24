import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dde-group-button',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!adding()) {
      <div class="header">
        <h2>Groups</h2>
        <button
          [disabled]="disabled()"
          (click)="adding.set(true)"
          class="add-btn"
          aria-label="Add group"
        >
          +
        </button>
      </div>
    } @else {
      <div class="input-row">
        <input
          type="text"
          [(ngModel)]="newGroupName"
          placeholder="New group name"
          maxlength="100"
          class="name-input"
        />
        <button class="confirm-btn" (click)="confirmAdd()" aria-label="Confirm">
          &#10003;
        </button>
        <button class="cancel-btn" (click)="cancelAdd()" aria-label="Cancel">
          &#10005;
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h2 {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--md-sys-color-outline, #787680);
      margin: 0;
    }
    .add-btn {
      width: 28px;
      height: 28px;
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    .add-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .input-row {
      display: flex;
      gap: var(--md-sys-spacing-xs, 4px);
      align-items: center;
    }
    .name-input {
      flex: 1;
      padding: var(--md-sys-spacing-xs, 4px) var(--md-sys-spacing-sm, 8px);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .confirm-btn,
    .cancel-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      line-height: 1;
    }
    .confirm-btn {
      background: var(--md-sys-color-success, #108400);
      color: white;
    }
    .cancel-btn {
      background: var(--md-sys-color-error, #ba1a1a);
      color: white;
    }
  `,
})
export class GroupButtonComponent {
  disabled = input(false);
  groupCreated = output<string>();

  adding = signal(false);
  newGroupName = '';

  confirmAdd() {
    if (this.newGroupName.trim()) {
      this.groupCreated.emit(this.newGroupName.trim());
      this.adding.set(false);
      this.newGroupName = '';
    }
  }

  cancelAdd() {
    this.adding.set(false);
    this.newGroupName = '';
  }
}
