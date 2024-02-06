import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from '../reducers/ui.reducer';
import { selectDatasetVariables } from './dataset.selectors';
import {
  selectVariableWeights,
  selectVariablesWithGroupsReference,
} from './var-groups.selectors';
import { VariableForm, initVariableForm } from '../interface';
export const selectUIFeature = createFeatureSelector<UIState>('ui');

export const selectIsOptionsMenuOpen = createSelector(
  selectUIFeature,
  (state) => state.modal.open && state.modal.mode === 'options'
);

export const selectOpenVariableModalMode = createSelector(
  selectUIFeature,
  (state) => state.modal.mode
);

export const selectOpenVariableID = createSelector(
  selectUIFeature,
  (state) => state.modal.variableID
);

export const selectOpenVariableData = createSelector(
  selectOpenVariableID,
  selectDatasetVariables,
  (variableID, datasetVariables) => {
    if (datasetVariables && variableID) {
      return datasetVariables[variableID];
    }
    return;
  }
);

export const selectOpenVariableDataID = createSelector(
  selectOpenVariableData,
  (variable) => {
    return variable?.['@_ID'];
  }
);

export const selectOpenVariableDataName = createSelector(
  selectOpenVariableData,
  (variable) => {
    return variable?.['@_name'];
  }
);

export const selectOpenVariableSelectedGroups = createSelector(
  selectOpenVariableID,
  selectVariablesWithGroupsReference,
  (openVariableID, variablesWithGroups) => {
    if (openVariableID && variablesWithGroups) {
      return variablesWithGroups[openVariableID].groups;
    }
    return [];
  }
);

export const selectOpenVariableDataAsForm = createSelector(
  selectOpenVariableID,
  selectDatasetVariables,
  selectVariableWeights,
  selectOpenVariableSelectedGroups,
  (variableID, datasetVariables, variableWeights, groups) => {
    const formData: VariableForm = initVariableForm;
    if (datasetVariables && variableID) {
      formData.id = datasetVariables[variableID]['@_ID'];
      formData.label = datasetVariables[variableID].labl['#text'];
      formData.literalQuestion = datasetVariables[variableID].qstn?.qstnLit;
      formData.interviewQuestion =
        datasetVariables[variableID].qstn?.ivuInstr || '';
      formData.postQuestion = datasetVariables[variableID].qstn?.postQTxt || '';
      formData.universe = datasetVariables[variableID].universe || '';
      formData.notes = datasetVariables[variableID].notes['#text'] || '';
      formData.weight = datasetVariables[variableID]['@_wgt-var'] || '';
      formData.isWeight = datasetVariables[variableID]['@_wgt'] ? true : false;
      return { formData, variableWeights, groups };
    }
    return;
  }
);

export const selectOpenVariableWeight = createSelector(
  selectOpenVariableID,
  selectDatasetVariables,
  (openVarID, datasetVariables) => {
    if (openVarID && datasetVariables) {
      return datasetVariables[datasetVariables[openVarID]['@_wgt-var']];
    }
    return null;
  }
);
