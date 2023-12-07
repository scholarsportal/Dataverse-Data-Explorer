import { Component, ElementRef, Input, Output, ViewChild, OnInit, EventEmitter } from '@angular/core';
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
  @Input() groups: any = {};
  @Output() groupChange: EventEmitter<any> = new EventEmitter<any>();

  hidden = true;
  allGroups$ = this.store.select(selectGroups);
  variableGroups: any = {};
  allGroups: any = {};

  constructor(private store: Store) {}

  ngOnInit(): void {
    console.log(this.groups)
    this.store.select(selectOpenVariableGroups).subscribe((groups) => {
      if(groups){
        // Not cloning the objects, makes the modal non-configurable
        this.variableGroups = { ...groups }
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
      console.log(group)
    if (this.checkSelected(group)) {
      delete this.variableGroups[group['@_ID']]
    } else {
      this.variableGroups = {
        ...this.variableGroups,
        [group['@_ID']]: group['labl']
      }
    }

    this.groupChange.emit(this.variableGroups)
  }
}
