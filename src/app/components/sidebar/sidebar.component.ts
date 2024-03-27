import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  changeSelectedGroup,
  groupChangeName,
  groupCreateNew,
  groupDelete,
} from 'src/app/state/actions/var-and-groups.actions';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import { selectCurrentGroup } from 'src/app/state/selectors/var-groups.selectors';
import { OptionsComponent } from './options/options.component';
import { DefaultSidebarButtonComponent } from './default-sidebar-button/default-sidebar-button.component';
import { RenamingSidebarButtonComponent } from './renaming-sidebar-button/renaming-sidebar-button.component';
import { DeletingSidebarButtonComponent } from './deleting-sidebar-button/deleting-sidebar-button.component';
import { NgClass, AsyncPipe, KeyValuePipe } from '@angular/common';
import { NewGroupComponent } from './new-group/new-group.component';
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'dct-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    NewGroupComponent,
    NgClass,
    DeletingSidebarButtonComponent,
    RenamingSidebarButtonComponent,
    DefaultSidebarButtonComponent,
    OptionsComponent,
    AsyncPipe,
    KeyValuePipe,
  ],
  animations: [
    trigger('groupAnimation', [
      transition(':enter', [
        query('.all-groups > ol', [
          style({ opacity: 0, transform: 'translateX(-100%)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ])
      ]),
      transition(':leave', [
        query('.all-groups > ol', [
          style({ opacity: 1, transform: 'translateX(0)' }),
          stagger(-100, [
            animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
          ])
        ])
      ])
    ])
  ]
})
export class SidebarComponent {
  groups$ = this.store.select(selectDatasetVariableGroups);
  selectedGroup$ = this.store.select(selectCurrentGroup);
  // recentlyChanged$ = this.store.select(selectRecentlyChangedGroup);
  addingNewGroup: boolean = false;
  deletingGroup: boolean = false;
  renamingGroup: boolean = false;
  groupToBeChanged: string | null = null;
  renameInputValue: string = '';

  constructor(private store: Store) {}

  getLabel(selection: any) {
    return selection?.labl || '<NO LABEL ON GROUP>';
  }

  getID(selection: any) {
    return selection['@_ID'];
  }

  changeGroup(selection: any | null) {
    if (!selection) {
      this.store.dispatch(changeSelectedGroup({ groupID: null }));
    } else {
      const groupID = { groupID: selection['@_ID'] };
      this.store.dispatch(changeSelectedGroup(groupID));
    }
  }

  startGroupDelete(groupID: any) {
    this.groupToBeChanged = groupID;
    this.deletingGroup = true;
    this.renamingGroup = false;
  }

  cancelGroupDelete() {
    this.groupToBeChanged = null;
    this.deletingGroup = false;
  }

  deleteGroup(group: any) {
    this.store.dispatch(groupDelete({ groupID: group['@_ID'] }));
  }

  startGroupRename(id: string) {
    this.groupToBeChanged = id;
    this.renamingGroup = true;
    this.deletingGroup = false;
  }

  cancelGroupRename() {
    this.groupToBeChanged = null;
    this.renameInputValue = '';
  }

  renameGroup(newName: string) {
    if (newName !== '' && this.groupToBeChanged) {
      this.store.dispatch(
        groupChangeName({
          groupID: this.groupToBeChanged,
          newName,
        }),
      );
    }
    this.groupToBeChanged = null;
    this.renameInputValue = '';
  }

  startAddingNewGroup() {
    this.addingNewGroup = true;
  }

  addGroup(name: string) {
    const id = `NVG${Math.floor(Math.random() * 1000000)}`;
    this.store.dispatch(groupCreateNew({ groupID: id, label: name }));
  }

  confirmGroup(name: string) {
    this.addGroup(name);
    this.resetUI();
  }

  cancelGroup() {
    this.resetUI();
  }

  resetUI() {
    this.addingNewGroup = false;
  }
}
