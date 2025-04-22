import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RenamingSidebarButtonComponent } from './renaming-button/renaming-sidebar-button.component';
import { DeletingSidebarButtonComponent } from './deleting-button/deleting-sidebar-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { XmlManipulationActions } from 'src/app/new.state/xml/xml.actions';

@Component({
  selector: 'dct-sidebar-button',
  standalone: true,
  imports: [
    CommonModule,
    RenamingSidebarButtonComponent,
    DeletingSidebarButtonComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar-button.component.html',
  styleUrl: './sidebar-button.component.css',
})
export class SidebarButtonComponent {
  store = inject(Store);

  groupID = input.required<string>();
  label = input.required<string>();
  selected = input.required<boolean>();
  disabledOptions = input<boolean>(false);

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
    this.store.dispatch(
      VariableTabUIAction.changeSelectedGroupID({ groupID: this.groupID() }),
    );
    const elem = document.activeElement;
    if (elem instanceof HTMLElement) {
      elem?.blur();
    }
    setTimeout(() => {
      const heading = document.querySelector('#tableHeading');
      if (heading) {
        (heading as HTMLElement)?.focus();
      }
    }, 1000);
  }

  delete() {
    this.deleting.set(true);
  }

  confirmDelete() {
    this.store.dispatch(
      XmlManipulationActions.deleteGroup({ groupID: this.groupID() }),
    );
    this.resetUI();
  }

  rename() {
    this.renaming.set(true);
  }

  confirmRename(newLabel: string) {
    this.store.dispatch(
      XmlManipulationActions.renameGroup({
        groupID: this.groupID(),
        newLabel,
      }),
    );
    this.resetUI();
  }

  resetUI() {
    this.renaming.set(false);
    this.deleting.set(false);
  }
}
