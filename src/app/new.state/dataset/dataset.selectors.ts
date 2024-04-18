import { DatasetState } from './dataset.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectDatasetVariableGroups, selectDatasetVariables } from '../xml/xml.selectors';

export const selectDatasetFeature =
  createFeatureSelector<DatasetState>('dataset');

export const selectDatasetDownloadPending = createSelector(
  selectDatasetFeature, (state) =>
    state.operationStatus.download === 'pending'
);

export const selectDatasetDownloadedSuccessfully = createSelector(
  selectDatasetFeature, selectDatasetVariables, selectDatasetVariableGroups, (state, variables, groups) => {
    return !!(state.operationStatus.download === 'success' && (variables?.length && groups?.length));
  }
);
