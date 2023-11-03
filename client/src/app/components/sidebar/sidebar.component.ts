import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { groupSelected } from 'src/state/actions';
import { selectGroups, selectVariablesByIDs } from 'src/state/selectors';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  groups$ = this.store.select(selectGroups)
  isSidebarExpanded = false;

  constructor(private store: Store) {}

  getLabel(selection: any) {
    return selection?.item?.labl || "<NO LABEL ON GROUP>"
  }

  changeGroup(selection: any) {
    console.log(selection.item['@_ID'])
    const groupID = { groupID: selection.item['@_ID'] }
    this.store.dispatch(groupSelected(groupID))
  }
}
