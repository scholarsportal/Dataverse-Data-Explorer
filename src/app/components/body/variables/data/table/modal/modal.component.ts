import { Component, computed, ElementRef, HostListener, inject, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { EditComponent } from './edit/edit.component';
import { ModalHeaderComponent } from './modal-header/modal-header.component';
import { ModalFooterComponent } from './modal-footer/modal-footer.component';
import { Store } from '@ngrx/store';
import {
  selectOpenVariableCategoriesMissing,
  selectOpenVariableChart,
  selectOpenVariableChartTable,
  selectOpenVariableFormState,
  selectOpenVariableHasCategories,
  selectOpenVariableID,
  selectOpenVariableMode,
  selectOpenVariableName,
  selectOpenVariableSummaryStatistics
} from 'src/app/new.state/ui/ui.selectors';
import {
  selectDatasetProcessedGroups,
  selectVariablesWithCorrespondingGroups
} from 'src/app/new.state/xml/xml.selectors';
import { selectDatasetWeights } from 'src/app/new.state/dataset/dataset.selectors';

@Component({
  selector: 'dct-modal',
  standalone: true,
  imports: [
    CommonModule,
    ChartComponent,
    EditComponent,
    ModalHeaderComponent,
    ModalFooterComponent
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  store = inject(Store);
  @ViewChild('variableModal') variableModal?: ElementRef;
  // header
  nextVar = input.required<string>();
  previousVar = input.required<string>();
  // form data
  hasCategories = this.store.selectSignal(selectOpenVariableHasCategories);
  modalMode = this.store.selectSignal(selectOpenVariableMode);
  variableFormData = this.store.selectSignal(selectOpenVariableFormState);
  variableName = this.store.selectSignal(selectOpenVariableName);
  variableID = this.store.selectSignal(selectOpenVariableID);
  allGroups = this.store.selectSignal(selectDatasetProcessedGroups);
  variablesAndTheirGroups = this.store.selectSignal(selectVariablesWithCorrespondingGroups);
  variableGroups = computed(() => {
    return this.variablesAndTheirGroups()[this.variableID()] || [];
  });
  allWeights = this.store.selectSignal(selectDatasetWeights);
  // chart data
  categoriesInvalid = this.store.selectSignal(selectOpenVariableCategoriesMissing);
  chart = this.store.selectSignal(selectOpenVariableChart);
  chartTable = this.store.selectSignal(selectOpenVariableChartTable);
  sumStats = this.store.selectSignal(selectOpenVariableSummaryStatistics);

  open() {
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    modal.showModal();
  }

  close() {
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    modal.close();
    // this.store.dispatch(closeVariableModal());
  }

  // Listen for escape and dispatch close action
  @HostListener('document:keydown.escape', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    const modal = this.variableModal?.nativeElement as HTMLDialogElement;
    // if (modal?.open && event.key === 'Escape') {
    //   this.store.dispatch(closeVariableModal());
    // }
  }
}
