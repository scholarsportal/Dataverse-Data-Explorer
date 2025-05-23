import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Store } from '@ngrx/store';

// Selectors
import {
  selectUserHasUploadAccess,
  selectDatasetProcessedGroups,
} from 'src/app/new.state/xml/xml.selectors';
import {
  selectCurrentGroupID,
  selectImportComponentState,
} from 'src/app/new.state/ui/ui.selectors';
// Actions
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { XmlManipulationActions } from 'src/app/new.state/xml/xml.actions';
import { KeyValuePipe, NgClass } from '@angular/common';
import { SidebarButtonComponent } from './sidebar-button/sidebar-button.component';
import { GroupButtonComponent } from './group-button/group-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    SidebarButtonComponent,
    NgClass,
    GroupButtonComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  store = inject(Store);
  hasApiKey = this.store.selectSignal(selectUserHasUploadAccess);

  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  simplifiedGroups = computed(() => {
    const simple: { [groupID: string]: string } = {};
    // Simple object with groupID as key and label as value
    Object.values(this.groups()).map((variableGroup) => {
      simple[variableGroup['@_ID']] = variableGroup.labl;
    });
    const sortedEntries = Object.entries(simple)
      // Map the entries to an array of objects with id and label
      .map(([id, label]) => ({ id, label }))
      // Sort the entries by label
      .sort((a, b) => a.label.localeCompare(b.label));
    return sortedEntries;
  });

  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  importComponentState = this.store.selectSignal(selectImportComponentState);
  importButtonSelected = computed(() => {
    let styleLabel = '';
    if (this.importComponentState() === 'open') {
      styleLabel = 'bg-red';
    }
    return styleLabel;
  });

  toggleImportComponentState() {
    if (this.importComponentState() === 'open') {
      this.store.dispatch(VariableTabUIAction.closeVariableImportMenu());
    } else {
      this.store.dispatch(VariableTabUIAction.openVariableImportMenu());
    }
  }

  createGroup(label: string) {
    const existingGroupIDs = Object.keys(this.groups());
    let newGroupID: string;
    do {
      newGroupID = `VG${Math.floor(Math.random() * 90000) + 10000}`;
    } while (existingGroupIDs.includes(newGroupID));
    this.store.dispatch(
      XmlManipulationActions.createGroup({
        groupID: newGroupID,
        label,
      }),
    );
  }

  changeGroup(groupID: string) {
    // NOTE: Is this related to DaisyUI
    // const elem = document.activeElement;
    // if (elem instanceof HTMLElement) {
    //   elem?.blur();
    // }
    this.store.dispatch(VariableTabUIAction.changeSelectedGroupID({ groupID }));
  }
}
