import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DatasetState } from '../reducers/dataset.reducer';
import { Variable } from '../interface';

export const selectDatasetFeature = createFeatureSelector<DatasetState>('data');

export const selectDataset = createSelector(
  selectDatasetFeature,
  (state) => state
);

export const selectDatasetLoading = createSelector(
  selectDatasetFeature,
  (state) => state.status
);

export const selectDatasetTitle = createSelector(selectDataset, (state) => {
  return state.dataset?.codeBook.stdyDscr.citation.titlStmt.titl;
});

export const selectDatasetCitation = createSelector(
  selectDataset,
  (state) => state.dataset?.codeBook.stdyDscr.citation.biblCit
);

export const selectDatasetVariableGroups = createSelector(
  selectDataset,
  (state) => state.dataset?.codeBook.dataDscr.varGrp
);

export const selectDatasetVariables = createSelector(
  selectDataset,
  (state) => state.dataset?.codeBook.dataDscr.var
);

export const selectDatasetProcessedVariables = createSelector(
  selectDatasetVariables,
  (variables) => {
    const processedVariables: { [variableID: string]: Variable } = {};
    variables?.map((value) => {
      processedVariables[value['@_ID']] = value;
    });
    return processedVariables;
  }
);
