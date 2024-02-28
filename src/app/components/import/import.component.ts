import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadButtonComponent } from './file-upload-button/file-upload-button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dct-import',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadButtonComponent],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css',
})
export class ImportComponent {
  file: File | undefined = undefined;
  // variable options
  variableGroups = false;
  labels = false;
  literalQuestion = false;
  interviewerQuestion = false;
  postQuestion = false;
  universe = false;
  variableNotes = false;
  weights = false;

  onFileSelected(file: File) {
    // Handle the selected file here
    this.file = file;
  }

  questionTextSelection(): boolean {
    return (
      this.literalQuestion && this.interviewerQuestion && this.postQuestion
    );
  }
  questionTextIndeterminate(): boolean {
    return (
      this.literalQuestion || this.interviewerQuestion || this.postQuestion
    );
  }

  onQuestionTextSelect() {
    const questionText =
      this.literalQuestion && this.interviewerQuestion && this.postQuestion;
    if (questionText) {
      this.literalQuestion = false;
      this.interviewerQuestion = false;
      this.postQuestion = false;
    } else {
      this.literalQuestion = true;
      this.interviewerQuestion = true;
      this.postQuestion = true;
    }
  }
}
