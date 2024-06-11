import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-group-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-button.component.html',
  styleUrl: './group-button.component.css'
})
export class GroupButtonComponent {
  newGroupName: string = '';

  emitConfirm = output<string>();

  adding = signal(false);

  confirmAdd() {
    if (this.newGroupName) {
      this.emitConfirm.emit(this.newGroupName);
    }
  }

  cancelAdd() {
    this.adding.set(false);
  }
}
