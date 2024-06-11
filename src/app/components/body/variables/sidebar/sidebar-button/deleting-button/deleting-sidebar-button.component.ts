import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dct-deleting-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deleting-sidebar-button.component.html',
  styleUrl: './deleting-sidebar-button.component.css'
})
export class DeletingSidebarButtonComponent {
  @Output() emitConfirm: EventEmitter<boolean> = new EventEmitter();
  @Output() emitCancel: EventEmitter<boolean> = new EventEmitter();

  confirmDelete() {
    this.emitConfirm.emit();
  }

  cancelDelete() {
    this.emitCancel.emit();
  }
}
