import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectGroups } from 'src/state/selectors';
import { selectOpenVariableGroups } from 'src/state/selectors/modal.selectors';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.css']
})
export class MultiselectDropdownComponent implements OnInit {
  @ViewChild('groups') groupsElementRef?: ElementRef;

  hidden = true;
  allGroups$ = this.store.select(selectGroups);
  variableGroups: any = {};
  allGroups: any = {};

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectOpenVariableGroups).subscribe((groups) => {
      if(groups){
        this.variableGroups = groups
        console.log(this.variableGroups)
      }
    })
  }

  onClick() {
    this.hidden ? this.open() : this.close()
  }

  open() {
    const groups = this.groupsElementRef?.nativeElement as HTMLDialogElement;
    groups?.show();
    this.hidden = false;
  }

  close() {
    const groups = this.groupsElementRef?.nativeElement as HTMLDialogElement;
    groups?.close();
    this.hidden = true;
  }

  getGroupID(group: any) {
    return group['@_ID']
  }

  getGroupName(group: any) {
    return group['labl']
  }

  checkSelected(group: any) {
    return Object.keys(this.variableGroups).includes(group['@_ID'])
  }

  changeGroup(group: any) {
    if (this.checkSelected(group)) {
      delete this.variableGroups[group['@_ID']]
    } else {
      this.variableGroups = {
        ...this.variableGroups,
        [group['@_ID']]: group['labl']
      }
    }
  }
}
