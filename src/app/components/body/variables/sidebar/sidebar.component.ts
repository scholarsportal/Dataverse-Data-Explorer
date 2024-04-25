import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';

// Selectors
import { selectDatasetProcessedGroups } from 'src/app/new.state/xml/xml.selectors';
import { selectCurrentGroupID, selectImportComponentState } from 'src/app/new.state/ui/ui.selectors';
// Actions
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { XmlManipulationActions } from 'src/app/new.state/xml/xml.actions';
import { KeyValuePipe, NgClass } from '@angular/common';
import { SidebarButtonComponent } from './sidebar-button/sidebar-button.component';

@Component({
  selector: 'dct-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    KeyValuePipe,
    SidebarButtonComponent,
    NgClass
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  store = inject(Store);

  groups = this.store.selectSignal(selectDatasetProcessedGroups);
  simplifiedGroups = computed(() => {
    let simple: { [groupID: string]: string } = {};
    Object.values(this.groups()).map(variableGroup => {
      simple[variableGroup['@_ID']] = variableGroup.labl;
    });
    return simple;
  });

  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  selectedGroupLabel = computed(() => {
    let label = 'All Variables';
    if (this.groups()[this.selectedGroupID()]) {
      label = this.groups()[this.selectedGroupID()].labl;
    }
    return label;
  });

  importComponentState = this.store.selectSignal(selectImportComponentState);
  importButtonSelected = computed(() => {
    let styleLabel = '';
    if (this.importComponentState() === 'open') {
      styleLabel = 'import-selected';
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

  changeGroup(groupID: string) {
    // const elem = document.activeElement;
    // if (elem instanceof HTMLElement) {
    //   elem?.blur();
    // }
    this.store.dispatch(VariableTabUIAction.changeSelectedGroupID({ groupID }));
  }

  deleteGroup(group: any) {
    this.store.dispatch(XmlManipulationActions.deleteGroup({ groupID: group['@_ID'] }));
  }

  renameGroup(newLabel: string) {
    // if (newLabel !== '' && this.groupToBeChanged) {
    //   this.store.dispatch(
    //     XmlManipulationActions.renameGroup({
    //       groupID: this.groupToBeChanged,
    //       newLabel
    //     })
    //   );
    // }
  }

  // startAddingNewGroup() {
  //   this.addingNewGroup = true;
  // }

  addGroup(name: string) {
    const id = `NVG${Math.floor(Math.random() * 1000000)}`;
    this.store.dispatch(XmlManipulationActions.createGroup({ groupID: id, label: name }));
  }

  confirmGroup(name: string) {
    this.addGroup(name);
    this.resetUI();
  }

  cancelGroup() {
    this.resetUI();
  }

  resetUI() {
    // this.addingNewGroup = false;
  }
}
