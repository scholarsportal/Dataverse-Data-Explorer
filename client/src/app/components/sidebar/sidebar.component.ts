import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import {
  groupChangeName,
  groupCreateNew,
  groupDelete,
  groupSelected,
} from 'src/state/actions/group.actions';
import {
  checkOpenGroup,
  selectGroups,
  selectRecentlyChangedGroup,
} from 'src/state/selectors';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  groups$ = this.store.select(selectDatasetVariableGroups);
  selectedGroup$ = this.store.select(checkOpenGroup);
  recentlyChanged$ = this.store.select(selectRecentlyChangedGroup);
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

  changeGroup(selection: any | string) {
    if (selection === '') {
      this.store.dispatch(groupSelected({ groupID: '' }));
    } else {
      const groupID = { groupID: selection['@_ID'] };
      this.store.dispatch(groupSelected(groupID));
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
