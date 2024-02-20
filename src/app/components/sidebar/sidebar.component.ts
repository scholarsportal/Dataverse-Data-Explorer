import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  changeSelectedGroup,
  groupChangeName,
  groupCreateNew,
  groupDelete,
} from 'src/app/state/actions/var-and-groups.actions';
import { Variable, VariableGroup } from 'src/app/state/interface';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import { selectCurrentGroup } from 'src/app/state/selectors/var-groups.selectors';

@Component({
  selector: 'dct-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  groups$ = this.store.select(selectDatasetVariableGroups);
  selectedGroup$ = this.store.select(selectCurrentGroup);
  // recentlyChanged$ = this.store.select(selectRecentlyChangedGroup);
  addingNewGroup: boolean = false;
  newGroupName: string = '';
  groupToBeRenamedID: any = null;
  renameInputValue: string = '';

  constructor(private store: Store) {}

  getLabel(selection: any) {
    return selection?.labl || '<NO LABEL ON GROUP>';
  }

  getID(selection: any) {
    return selection['@_ID'];
  }

  checkGroups(groups: any) {
    return Object.keys(groups).length > 0;
  }

  changeGroup(selection: any | null) {
    if (!selection) {
      this.store.dispatch(changeSelectedGroup({ groupID: null }));
    } else {
      const groupID = { groupID: selection['@_ID'] };
      this.store.dispatch(changeSelectedGroup(groupID));
    }
  }

  addGroup() {
    const id = `NVG${Math.floor(Math.random() * 1000000)}`;
    const name = this.newGroupName;
    this.store.dispatch(groupCreateNew({ groupID: id, label: name }));
  }

  deleteGroup(group: any) {
    console.log(group);
    this.store.dispatch(groupDelete({ groupID: group['@_ID'] }));
  }

  startRename(item: any) {
    this.groupToBeRenamedID = this.getID(item);
    this.renameInputValue = this.getLabel(item);
  }

  cancelRename() {
    this.groupToBeRenamedID = null;
    this.renameInputValue = '';
  }

  renameGroup() {
    const renamedValue = this.renameInputValue.trim();
    if (renamedValue !== '') {
      this.store.dispatch(
        groupChangeName({
          groupID: this.groupToBeRenamedID,
          newName: renamedValue,
        })
      );
    }
    this.groupToBeRenamedID = null;
    this.renameInputValue = '';
  }

  toggleAddingNewGroup() {
    this.addingNewGroup = !this.addingNewGroup;
    if (!this.addingNewGroup) {
      this.newGroupName = ''; // Reset the input field when exiting edit mode
    }
  }

  confirmGroup() {
    if (this.newGroupName.trim() !== '') {
      this.addGroup();
      this.resetUI();
    } else {
      alert('Please enter a valid group name.');
    }
  }

  cancelGroup() {
    this.resetUI();
  }

  resetUI() {
    this.addingNewGroup = false;
    this.newGroupName = '';
  }
}
