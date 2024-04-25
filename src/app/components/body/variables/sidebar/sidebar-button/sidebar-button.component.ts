import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'dct-sidebar-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar-button.component.html',
  styleUrl: './sidebar-button.component.css'
})
export class SidebarButtonComponent {
  store = inject(Store);

  groupID = input.required<string>();
  label = input.required<string>();
  selected = input.required<boolean>();

  changeSelectedGroupID = output<string>();


  handleClick() {
    this.changeSelectedGroupID.emit(this.groupID());
    const elem = document.activeElement;
    if (elem instanceof HTMLElement) {
      elem?.blur();
    }
  }

  delete() {
    // this.startDelete.emit(this.groupID());
  }

  rename() {
    // this.startRename.emit(this.groupID());
  }
}
