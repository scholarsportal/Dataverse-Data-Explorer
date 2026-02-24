import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { DdeVariableGroup } from '@dde/models';
import { GroupButtonComponent } from './group-button';

@Component({
  selector: 'dde-sidebar',
  standalone: true,
  imports: [GroupButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation' },
  styles: `
    :host {
      display: grid;
      grid-template-rows: repeat(12, 1fr);
      grid-template-columns: 1fr;
      height: 100%;
    }
    .add-group-btn {
      grid-area: 1 / 1 / 2 / 2;
      border-block-end: 1px solid #e0e0e0;
    }
    .group-list {
      grid-area: 2 / 1 / 12 / 2;
      height: 100%;
    }
    .import-btn {
      grid-area: 12 / 1 / 13 / 2;
      border-block-start: 1px solid #e0e0e0;
    }
  `,
  template: `
    <dde-group-button
      class="add-group-btn"
      [disabled]="!hasEditPermission()"
      (groupCreated)="groupCreated.emit($event)"
    />

    <div class="group-list">
      <button
        class="group-btn all"
        [class.selected]="selectedGroupId() === null"
        (click)="selectGroup(null)"
      >
        All Variables
      </button>

      @for (group of groups(); track group.id) {
        <button
          class="group-btn"
          [class.selected]="selectedGroupId() === group.id"
          (click)="selectGroup(group.id)"
        >
          {{ group.label }}
        </button>
      } @empty {
        <p class="empty">No groups</p>
      }
    </div>

    @if (hasEditPermission()) {
      <button class="import-btn" (click)="importClicked.emit()">
        Import Metadata
      </button>
    }
  `,
})
export class SidebarComponent {
  groups = input<DdeVariableGroup[]>([]);
  hasEditPermission = input(false);

  groupSelected = output<string | null>();
  groupCreated = output<string>();
  importClicked = output<void>();

  selectedGroupId = signal<string | null>(null);

  selectGroup(id: string | null) {
    this.selectedGroupId.set(id);
    this.groupSelected.emit(id);
  }
}
