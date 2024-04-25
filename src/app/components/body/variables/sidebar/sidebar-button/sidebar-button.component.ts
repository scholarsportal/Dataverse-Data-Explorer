import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RenamingSidebarButtonComponent } from './renaming-button/renaming-sidebar-button.component';
import { DeletingSidebarButtonComponent } from './deleting-button/deleting-sidebar-button.component';

@Component({
  selector: 'dct-sidebar-button',
  standalone: true,
  imports: [CommonModule, RenamingSidebarButtonComponent, DeletingSidebarButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar-button.component.html',
  styleUrl: './sidebar-button.component.css'
})
export class SidebarButtonComponent {
  store = inject(Store);

  groupID = input.required<string>();
  label = input.required<string>();
  selected = input.required<boolean>();

  changeSelectedGroupID = output<string>();
  emitDeleteGroup = output<string>();
  emitRenameGroup = output<{ groupID: string, newLabel: string }>();

  renaming = signal(false);
  renamingActive = computed(() => {
    return this.selected() && this.renaming();
  });

  deleting = signal(false);
  deletingActive = computed(() => {
    return this.selected() && this.deleting();
  });

  handleClick() {
    this.resetUI();
    this.changeSelectedGroupID.emit(this.groupID());
    const elem = document.activeElement;
    if (elem instanceof HTMLElement) {
      elem?.blur();
    }
  }

  delete() {
    this.deleting.set(true);
  }

  confirmDelete() {
    this.resetUI();
    this.emitDeleteGroup.emit(this.groupID());
  }

  rename() {
    this.renaming.set(true);
  }

  confirmRename(newLabel: string) {
    this.resetUI();
    this.emitRenameGroup.emit({ groupID: this.groupID(), newLabel });
  }

  resetUI() {
    this.renaming.set(false);
    this.deleting.set(false);
  }
}
