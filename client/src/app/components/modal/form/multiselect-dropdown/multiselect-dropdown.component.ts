import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  OnInit,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectGroups } from 'src/state/selectors';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.css'],
})
export class MultiselectDropdownComponent implements OnInit, OnChanges {
  @ViewChild('groups') groupsElementRef?: ElementRef;
  @Output() groupChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() variableGroups$: any = null;

  hidden = true;
  allGroups$ = this.store.select(selectGroups);
  variableGroups: any = {};
  empty: boolean = true;

  constructor(private store: Store) {}

  ngOnInit(): void {
    if (this.variableGroups$) {
      // Not cloning the objects, makes the modal non-configurable
      this.variableGroups = { ...this.variableGroups$ };
    }
    this.empty = Object.keys( this.variableGroups ).length === 0 ? true : false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['variableGroups$'].currentValue !== changes['variableGroups$'].previousValue) {
      this.variableGroups = { ...changes['variableGroups$'].currentValue }
    }
    this.empty = Object.keys( this.variableGroups ).length === 0 ? true : false;
  }

  onClick() {
    this.hidden ? this.open() : this.close();
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

  checkSelected(group: any) {
    return Object.keys(this.variableGroups).includes(group['@_ID']);
  }

  changeGroup(group: any) {
    if (this.checkSelected(group)) {
      delete this.variableGroups[group['@_ID']];
    } else {
      this.variableGroups = {
        ...this.variableGroups,
        [group['@_ID']]: group['labl'],
      };
    }

    this.empty = (!Object.keys( this.variableGroups ).length) ? false : true
    this.groupChange.emit(this.variableGroups);
  }
}
