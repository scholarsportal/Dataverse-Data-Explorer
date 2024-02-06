import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from '../reducers/ui.reducer';
import { selectDatasetVariables } from './dataset.selectors';
import { selectVariablesWithGroupsReference } from './var-groups.selectors';
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
