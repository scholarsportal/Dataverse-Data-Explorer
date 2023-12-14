import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  OnInit,
  EventEmitter,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { selectGroups } from 'src/state/selectors';
import { selectOpenVariableGroups } from 'src/state/selectors/modal.selectors';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.css'],
})
export class MultiselectDropdownComponent implements OnInit {
  @ViewChild('groups') groupsElementRef?: ElementRef;
  @Output() groupChange: EventEmitter<any> = new EventEmitter<any>();

  hidden = true;
  allGroups$ = this.store.select(selectGroups);
  variableGroups: any = {};
  empty: boolean = true;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectOpenVariableGroups)
      .pipe(take(1))
      .subscribe((groups) => {
        if (groups) {
          // Not cloning the objects, makes the modal non-configurable
          this.variableGroups = { ...groups };
          this.empty = this.variableGroups.length === 0 ? true : false;
        }
      });
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

    this.groupChange.emit(this.variableGroups);
  }
}
