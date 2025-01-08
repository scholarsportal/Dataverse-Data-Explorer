// Path: src/app/components/body/variables/sidebar/sidebar-button/deleting-button/deleting-sidebar-button.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-deleting-button',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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
