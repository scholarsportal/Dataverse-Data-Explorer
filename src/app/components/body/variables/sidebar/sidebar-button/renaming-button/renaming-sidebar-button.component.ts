// Path: src/app/components/body/variables/sidebar/sidebar-button/renaming-button/renaming-sidebar-button.component.ts
import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-renaming-button',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './renaming-sidebar-button.component.html',
  styleUrl: './renaming-sidebar-button.component.css'
})
export class RenamingSidebarButtonComponent {
  labelPlaceholder: string = '';

  label = input.required<string>();
  emitConfirm = output<string>();
  emitCancel = output();

  constructor() {
    effect(() => {
      this.changeLabel(this.label());
    });
  }

  changeLabel(label: string) {
    this.labelPlaceholder = label;
  }

  confirmRename() {
    this.emitConfirm.emit(this.labelPlaceholder);
  }

  cancelRename() {
    this.emitCancel.emit();
  }
}
