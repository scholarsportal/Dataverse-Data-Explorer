import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { selectCurrentGroup } from 'src/app/state/selectors/var-groups.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'dct-default-sidebar-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './default-sidebar-button.component.html',
  styleUrl: './default-sidebar-button.component.css',
})
export class DefaultSidebarButtonComponent {
  selectedGroup$ = this.store.select(selectCurrentGroup);
  @Input() groupID!: string;
  @Input() label!: string;
  @Output() changeGroup: EventEmitter<string> = new EventEmitter();
  @Output() startDelete: EventEmitter<any> = new EventEmitter();
  @Output() startRename: EventEmitter<string> = new EventEmitter();

  constructor(private store: Store) {}

  handleClick() {
    this.changeGroup.emit(this.groupID);
  }

  delete() {
    this.startDelete.emit(this.groupID);
  }

  rename() {
    this.startRename.emit(this.groupID);
  }
}
