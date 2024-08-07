import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadButtonComponent } from './file-upload-button/file-upload-button.component';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  selectDatasetImportIdle,
  selectDatasetImportPending,
  selectDatasetImportSuccess,
} from 'src/app/new.state/dataset/dataset.selectors';
import { ImportVariableFormTemplate } from '../../new.state/xml/xml.interface';
import { XmlManipulationActions } from '../../new.state/xml/xml.actions';
import { VariableTabUIAction } from '../../new.state/ui/ui.actions';

@Component({
  selector: 'dct-import',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadButtonComponent],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ImportComponent {
  importInProgress = this.store.selectSignal(selectDatasetImportPending);
  importNotStarted = this.store.selectSignal(selectDatasetImportIdle);
  importSucceeded = this.store.selectSignal(selectDatasetImportSuccess);
  file: File | undefined = undefined;
  // variable options-button
  variableGroups = false;
  labels = false;
  literalQuestion = false;
  interviewerQuestion = false;
  postQuestion = false;
  universe = false;
  variableNotes = false;
  weights = false;
  success = false;
  importing = true;
  error = false;
  loading = false;

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

  closeImportComponentState() {
    this.error = false;
    this.success = false;
    this.importing = false;
    this.store.dispatch(VariableTabUIAction.closeVariableImportMenu());
  }

  async onImportButtonClick() {
    this.error = false;
    this.importing = true;
    const importedXmlString = await this.file?.text();
    const variableTemplate: ImportVariableFormTemplate = {
      groups: this.variableGroups,
      label: this.labels,
      interviewQuestion: this.interviewerQuestion,
      literalQuestion: this.literalQuestion,
      postQuestion: this.postQuestion,
      notes: this.variableNotes,
      weight: this.weights,
      universe: this.universe,
    };
    if (importedXmlString) {
      this.store.dispatch(
        XmlManipulationActions.startImportMetadata({
          importedXmlString,
          variableTemplate,
        }),
      );
    }
    if (this.importSucceeded()) {
      this.importing = false;
      this.success = true;
    } else {
      this.importing = false;
      this.error = true;
    };
    
  }
}
