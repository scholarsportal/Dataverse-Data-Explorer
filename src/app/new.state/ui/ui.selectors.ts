import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SummaryStatistics, UIState, VariableForm } from './ui.interface';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
  selectVariablesWithCorrespondingGroups
} from '../xml/xml.selectors';

export const selectUIFeature =
  createFeatureSelector<UIState>('ui');

export const selectBodyToggleState = createSelector(
  selectUIFeature, state => state.bodyToggle
);

export const selectOpenVariableID = createSelector(
  selectUIFeature, state => state.bodyState.variables.openVariable.variableID
);

export const selectOpenVariableMode = createSelector(
  selectUIFeature, state => state.bodyState.variables.openVariable.mode
);

export const selectCurrentGroupID = createSelector(
  selectUIFeature, state => state.bodyState.variables.groupSelectedID
);

export const selectImportComponentState = createSelector(
  selectUIFeature, state => state.bodyState.variables.importComponentState
);

const selectOpenVariableGroups = createSelector(
  selectOpenVariableID, selectDatasetProcessedVariables, selectDatasetProcessedGroups, selectVariablesWithCorrespondingGroups, (variableID, variables, processedGroups, correspondingGroups) => {
    let groups: { [groupID: string]: string }[] = [];
    if (correspondingGroups[variableID]) {
      correspondingGroups[variableID].map(value =>
        groups.push({ [value]: processedGroups[value].labl || 'NO LABEL' })
      );
    }
    return groups;
  }
);

export const selectVariableSelectionContext = createSelector(
  selectUIFeature, state => state.bodyState.variables.variableSelectionContext
);

export const selectOpenVariableFormState = createSelector(
  selectOpenVariableID, selectDatasetProcessedVariables, selectOpenVariableGroups, (variableID, processedVariables, groups) => {
    let formState: VariableForm = { isWeight: false, groups: [] };
    if (processedVariables[variableID]) {
      formState = {
        isWeight: !!processedVariables[variableID]['@_wgt'],
        groups: groups,
        label: processedVariables[variableID].labl['#text'],
        literalQuestion: processedVariables[variableID].qstn?.qstnLit || '',
        interviewQuestion: processedVariables[variableID].qstn?.ivuInstr || '',
        postQuestion: processedVariables[variableID].qstn?.postQTxt || '',
        universe: processedVariables[variableID].universe,
        notes: processedVariables[variableID].notes['#text'] || '',
        assignedWeight: processedVariables[variableID]['@_wgt-var']
      };
    }
    return formState;
  }
);

export const selectOpenVariableSummaryStatistics = createSelector(
  selectOpenVariableID, selectDatasetProcessedVariables, selectDatasetProcessedGroups,
  (variableID, processedVariables, processedGroups) => {
    let summaryStatistics: SummaryStatistics = {
      mode: '',
      minimum: '',
      standardDeviation: '',
      median: '',
      mean: '',
      maximum: '',
      totalValidCount: '',
      totalInvalidCount: ''
    };
    if (processedVariables[variableID].sumStat) {
      processedVariables[variableID].sumStat.map(value => {
        switch (value['@_type']) {
          case 'mean':
            summaryStatistics.mean = (value['#text'] as string);
            break;
          case 'mode':
            summaryStatistics.mode = (value['#text'] as string);
            break;
          case 'medn':
            summaryStatistics.median = (value['#text'] as string);
            break;
          case 'invd':
            summaryStatistics.totalInvalidCount = (value['#text'] as string);
            break;
          case 'min':
            summaryStatistics.minimum = (value['#text'] as string);
            break;
          case 'stdev':
            summaryStatistics.standardDeviation = (value['#text'] as string);
            break;
          case 'max':
            summaryStatistics.maximum = (value['#text'] as string);
            break;
          case 'vald':
            summaryStatistics.totalValidCount = (value['#text'] as string);
            break;
        }
      });
    }
    return summaryStatistics;
  }
);
