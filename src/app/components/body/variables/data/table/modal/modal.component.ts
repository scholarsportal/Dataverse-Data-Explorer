import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { EditComponent } from './edit/edit.component';
import { ModalHeaderComponent } from './modal-header/modal-header.component';
import { ModalFooterComponent } from './modal-footer/modal-footer.component';
import { Store } from '@ngrx/store';
import {
  selectOpenVariableCategoriesMissing,
  selectOpenVariableChart,
  selectOpenVariableChartReference,
  selectOpenVariableChartTable,
  selectOpenVariableFormState,
  selectOpenVariableHasCategories,
  selectOpenVariableID,
  selectOpenVariableMode,
  selectOpenVariableName,
  selectOpenVariableLabel,
  selectOpenVariableSummaryStatistics,
} from 'src/app/new.state/ui/ui.selectors';
import {
  selectUserHasUploadAccess,
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
  selectVariablesWithCorrespondingGroups,
} from 'src/app/new.state/xml/xml.selectors';
import {
  selectDatasetVariableCrossTabValues,
  selectDatasetWeights,
} from 'src/app/new.state/dataset/dataset.selectors';

@Component({
  selector: 'dct-modal',
  standalone: true,
  imports: [
    CommonModule,
    ChartComponent,
    EditComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  store = inject(Store);
  @ViewChild('variableModal') variableModal?: ElementRef;
  // header
  nextVar = input.required<string>();
  previousVar = input.required<string>();
  // form data
  hasApiKey = this.store.selectSignal(selectUserHasUploadAccess);
  hasCategories = this.store.selectSignal(selectOpenVariableHasCategories);
  modalMode = this.store.selectSignal(selectOpenVariableMode);
  variableFormData = this.store.selectSignal(selectOpenVariableFormState);
  variableName = this.store.selectSignal(selectOpenVariableName);
  variableID = this.store.selectSignal(selectOpenVariableID);
  variableLabel = this.store.selectSignal(selectOpenVariableLabel);
  allGroups = this.store.selectSignal(selectDatasetProcessedGroups);
  variablesAndTheirGroups = this.store.selectSignal(
    selectVariablesWithCorrespondingGroups,
  );
  variableGroups = computed(() => {
    return this.variablesAndTheirGroups()[this.variableID()] || [];
  });
  allWeights = this.store.selectSignal(selectDatasetWeights);
  allVariables = this.store.selectSignal(selectDatasetProcessedVariables);
  variablesWithCrossTabMetadata = this.store.selectSignal(
    selectDatasetVariableCrossTabValues,
  );
  // chart data
  categoriesInvalid = this.store.selectSignal(
    selectOpenVariableCategoriesMissing,
  );
  chart = this.store.selectSignal(selectOpenVariableChart);
  chartReference = this.store.selectSignal(selectOpenVariableChartReference);
  chartTable = this.store.selectSignal(selectOpenVariableChartTable);
  sumStats = this.store.selectSignal(selectOpenVariableSummaryStatistics);
  saved: boolean = false;
  opened: boolean = false;

  open() {
    this.opened = true;
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    modal.showModal();
    console.log(this.variableLabel());
  }

  close() {
    this.opened = false;
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    modal.close();
  }

  closeLoadedToast() {
    this.saved = false;
  }

  showToast() {
    this.saved = true;
    setTimeout(() => {
      this.closeLoadedToast();
    }, 3000);
  }
}
