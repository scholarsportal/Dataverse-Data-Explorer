import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-new-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-group.component.html',
  styleUrl: './new-group.component.css',
})
export class NewGroupComponent {
  newGroupName: string = '';
  @Output() emitConfirm: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitCancel: EventEmitter<{}> = new EventEmitter<{}>();

  confirmAdd() {
    if (this.newGroupName) {
      this.emitConfirm.emit(this.newGroupName);
    }
  }
  cancelAdd() {
    this.emitCancel.emit();
  }
}
