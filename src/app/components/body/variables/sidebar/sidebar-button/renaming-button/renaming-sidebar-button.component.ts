import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-renaming-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renaming-sidebar-button.component.html',
  styleUrl: './renaming-sidebar-button.component.css'
})
export class RenamingSidebarButtonComponent {
  @Input() label!: string;
  @Output() emitConfirm: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitCancel: EventEmitter<boolean> = new EventEmitter();

  confirmRename() {
    this.emitConfirm.emit(this.label);
  }

  cancelRename() {
    this.emitCancel.emit();
  }
}
