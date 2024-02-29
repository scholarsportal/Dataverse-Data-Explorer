import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadButtonComponent } from './file-upload-button/file-upload-button.component';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { datasetImportMetadataStart } from 'src/app/state/actions/dataset.actions';
import { VariableForm } from 'src/app/state/interface';
import {
  selectDatasetImportInProgress,
  selectDatasetImportNotStarted,
  selectDatasetImportSuccess,
} from 'src/app/state/selectors/dataset.selectors';

@Component({
  selector: 'dct-import',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadButtonComponent],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css',
})
export class ImportComponent {
  importInProgress$ = this.store.select(selectDatasetImportInProgress);
  importNotStarted$ = this.store.select(selectDatasetImportNotStarted);
  importSucceeded$ = this.store.select(selectDatasetImportSuccess);
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

  constructor(private store: Store) {}

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

  async onImportButtonClick() {
    const fileText = await this.file?.text();
    const variableTemplate: VariableForm = {
      id: '',
      label: this.labels ? '' : 'null',
      interviewQuestion: this.interviewerQuestion ? '' : null,
      literalQuestion: this.literalQuestion ? '' : null,
      postQuestion: this.postQuestion ? '' : null,
      notes: this.variableNotes ? '' : null,
      weight: this.weights ? '' : null,
      universe: this.universe ? '' : null,
      isWeight: true,
    };
    if (fileText) {
      this.store.dispatch(
        datasetImportMetadataStart({ file: fileText, variableTemplate }),
      );
    }
  }
}
