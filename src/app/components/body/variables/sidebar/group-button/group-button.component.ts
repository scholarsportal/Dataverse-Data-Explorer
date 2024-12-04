import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-group-button',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './group-button.component.html',
  styleUrl: './group-button.component.css',
})
export class GroupButtonComponent {
  newGroupName: string = '';

  disabled = input<boolean>(false);
  emitConfirm = output<string>();

  adding = signal(false);

  confirmAdd() {
    if (this.newGroupName) {
      this.emitConfirm.emit(this.newGroupName);
      this.adding.set(false);
    }
  }

  cancelAdd() {
    this.adding.set(false);
  }
}
