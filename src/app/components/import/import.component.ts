import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadButtonComponent } from './file-upload-button/file-upload-button.component';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  selectDatasetImportError,
  selectDatasetImportIdle,
  selectDatasetImportPending,
  selectDatasetImportSuccess,
} from 'src/app/new.state/dataset/dataset.selectors';
import { ImportVariableFormTemplate } from '../../new.state/xml/xml.interface';
import { XmlManipulationActions } from '../../new.state/xml/xml.actions';
import { VariableTabUIAction } from '../../new.state/ui/ui.actions';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-import',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadButtonComponent, TranslateModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ImportComponent {
  importInProgress = this.store.selectSignal(selectDatasetImportPending);
  importNotStarted = this.store.selectSignal(selectDatasetImportIdle);
  importSucceeded = this.store.selectSignal(selectDatasetImportSuccess);
  importError = this.store.selectSignal(selectDatasetImportError);

  file: File | undefined = undefined;
  // variable options-button
  variableGroups = true;
  labels = true;
  literalQuestion = true;
  interviewerQuestion = true;
  postQuestion = true;
  universe = true;
  variableNotes = true;
  weights = true;
  success = true;
  importing = true;
  error = true;
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
    this.store.dispatch(VariableTabUIAction.closeVariableImportMenu());
  }

  resetImportComponentState() {
    this.file = undefined;
    this.store.dispatch(XmlManipulationActions.resetImport());
  }

  async onImportButtonClick() {
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
  }
}
