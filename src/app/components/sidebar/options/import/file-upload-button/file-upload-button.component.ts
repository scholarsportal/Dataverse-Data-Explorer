import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dct-file-upload-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload-button.component.html',
  styleUrl: './file-upload-button.component.css',
})
export class FileUploadButtonComponent {
  @Output() fileSelected = new EventEmitter<File>();

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
