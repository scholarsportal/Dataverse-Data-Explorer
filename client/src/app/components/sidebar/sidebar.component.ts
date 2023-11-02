import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectGroups } from 'src/state/selectors';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  groups$ = this.store.select(selectGroups)
  isSidebarExpanded = false;

  constructor(private store: Store) {  }

  getLabel(group: any){
    console.log(group)
    return group.item.labl || "<NO LABEL ON GROUP>"
  }
}
