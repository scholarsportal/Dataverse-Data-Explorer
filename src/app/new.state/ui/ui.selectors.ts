import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.interface';

export const selectUIFeature =
  createFeatureSelector<UIState>('ui');

export const selectBodyToggleState = createSelector(
  selectUIFeature, state => state.bodyToggle
);

const selectOpenVariableID = createSelector(
  selectUIFeature, state => state.bodyState.variables.openVariable.variableID
);

const selectCurrentGroupID = createSelector(
  selectUIFeature, state => state.bodyState.variables.groupSelectedID
);

export const selectImportComponentState = createSelector(
  selectUIFeature, state => state.bodyState.variables.importComponentState
);
