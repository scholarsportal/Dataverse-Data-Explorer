import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadButtonComponent } from './file-upload-button/file-upload-button.component';

@Component({
  selector: 'dct-import',
  standalone: true,
  imports: [CommonModule, FileUploadButtonComponent],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css',
})
export class ImportComponent {
  file?: File;

  onFileSelected(file: File) {
    // Handle the selected file here
    this.file = file;
  }
}
