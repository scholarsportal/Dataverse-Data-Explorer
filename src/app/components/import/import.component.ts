import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadButtonComponent } from './file-upload-button/file-upload-button.component';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  selectDatasetImportError,
  selectDatasetImportIdle,
  selectDatasetImportPending,
  selectDatasetImportReview,
  selectDatasetImportSuccess,
  selectImportGroupClashes,
} from 'src/app/new.state/dataset/dataset.selectors';
import {
  ImportGroupAction,
  ImportGroupClash,
  ImportGroupOption,
  ImportGroupResolutions,
  ImportVariableFormTemplate,
} from '../../new.state/xml/xml.interface';
import { XmlManipulationActions } from '../../new.state/xml/xml.actions';
import { selectImportSummary } from '../../new.state/xml/xml.selectors';
import { IMPORTED_GROUP_LABEL_PREFIX } from '../../new.state/xml/xml.util';
import { VariableTabUIAction } from '../../new.state/ui/ui.actions';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploadButtonComponent,
    TranslateModule,
  ],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ImportComponent {
  private store = inject(Store);
  importInProgress = this.store.selectSignal(selectDatasetImportPending);
  importNotStarted = this.store.selectSignal(selectDatasetImportIdle);
  importSucceeded = this.store.selectSignal(selectDatasetImportSuccess);
  importError = this.store.selectSignal(selectDatasetImportError);
  // Group names that need a decision before the import can be applied
  importNeedsReview = this.store.selectSignal(selectDatasetImportReview);
  groupClashes = this.store.selectSignal(selectImportGroupClashes);
  summary = this.store.selectSignal(selectImportSummary);

  readonly groupActions: readonly ImportGroupAction[] = [
    'replace',
    'merge',
    'keepBoth',
  ];
  readonly groupActionLabels: Record<ImportGroupAction, string> = {
    replace: 'IMPORT.GROUP_ACTION_REPLACE',
    merge: 'IMPORT.GROUP_ACTION_MERGE',
    keepBoth: 'IMPORT.GROUP_ACTION_KEEP_BOTH',
  };
  readonly importedGroupPrefix = IMPORTED_GROUP_LABEL_PREFIX.trim();
  // The user's choice per clashing group name; anything not chosen is replaced
  private groupChoices = signal<ImportGroupResolutions>({});

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

  constructor() {
    // The panel is created each time it is opened: start from a clean slate
    // rather than showing the outcome of an earlier import.
    this.store.dispatch(XmlManipulationActions.resetImport());
  }

  groupActionFor(label: string): ImportGroupAction {
    return this.groupChoices()[label]?.action ?? 'replace';
  }

  chooseGroupAction(label: string, action: ImportGroupAction) {
    this.groupChoices.update((choices) => ({
      ...choices,
      [label]: { ...choices[label], action },
    }));
  }

  // The existing group an imported group merges into; the first one until the
  // user picks another.
  mergeTargetFor(clash: ImportGroupClash, importedGroupID: string): string {
    return (
      this.groupChoices()[clash.label]?.targets?.[importedGroupID] ??
      clash.existing[0].id
    );
  }

  chooseMergeTarget(
    label: string,
    importedGroupID: string,
    existingGroupID: string,
  ) {
    this.groupChoices.update((choices) => ({
      ...choices,
      [label]: {
        action: 'merge',
        targets: {
          ...choices[label]?.targets,
          [importedGroupID]: existingGroupID,
        },
      },
    }));
  }

  // Groups in a clash share a label, so they are told apart by their contents
  describeGroup(group: ImportGroupOption): string {
    const shown = group.variableNames.slice(0, 5).join(', ');
    const more = group.variableNames.length > 5 ? ', …' : '';
    return `${group.variableCount}: ${shown}${more}`;
  }

  applyReviewedImport() {
    const groupResolutions: ImportGroupResolutions = {};
    this.groupClashes().forEach((clash) => {
      const action = this.groupActionFor(clash.label);
      groupResolutions[clash.label] =
        action === 'merge'
          ? {
              action,
              targets: Object.fromEntries(
                clash.imported.map((group) => [
                  group.id,
                  this.mergeTargetFor(clash, group.id),
                ]),
              ),
            }
          : { action };
    });
    this.store.dispatch(
      XmlManipulationActions.confirmImportGroupChoices({ groupResolutions }),
    );
  }

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
    this.groupChoices.set({});
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
