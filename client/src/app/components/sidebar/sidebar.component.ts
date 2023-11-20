import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { groupCreateNew, groupSelected } from 'src/state/actions';
import { checkOpenGroup, selectGroups } from 'src/state/selectors';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  groups$ = this.store.select(selectGroups);
  selectedGroup$ = this.store.select(checkOpenGroup)
  isSidebarExpanded = false;
  addingNew = false;
  editingMode: boolean = false;
  newGroupName: string = '';

  constructor(private store: Store) {}

  getLabel(selection: any) {
    return selection?.labl || '<NO LABEL ON GROUP>';
  }

  getID(selection: any) {
    return selection['@_ID'];
  }

  checkGroups(groups: any) {
    return Object.keys(groups).length > 0
  }

  checkSelectedGroup(group: any) {
    this.selectedGroup$.subscribe((data) => {
      return data ? (group['@_ID'] === data) : false
    })
    return false
  }

  changeGroup(selection: any | string) {
    if (selection === '') {
      this.store.dispatch(groupSelected({ groupID: '' }));
    } else {
      const groupID = { groupID: selection['@_ID'] };
      // console.log(groupID)
      this.store.dispatch(groupSelected(groupID));
    }
  }

  addGroup() {
    const id = `NVG${Math.floor(Math.random() * 1000000)}`
    const name = this.newGroupName
    console.log(id)
    this.store.dispatch(groupCreateNew({ groupID: id, label: name }))
  }

  toggleEditingMode() {
    this.editingMode = !this.editingMode;
    if (!this.editingMode) {
      this.newGroupName = ''; // Reset the input field when exiting edit mode
    }
  }

  confirmGroup() {
    if (this.newGroupName.trim() !== '') {
      // Perform actions with the entered group name (e.g., add it to a list)
      console.log('Group name:', this.newGroupName);
      this.addGroup()
      // Reset the UI
      this.resetUI();
    } else {
      alert('Please enter a valid group name.');
    }
  }

  cancelGroup() {
    this.resetUI();
  }

  resetUI() {
    this.editingMode = false;
    this.newGroupName = '';
  }
}
