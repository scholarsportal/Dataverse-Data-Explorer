import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JSONStructure } from '../interface';
import { State } from '../reducers';
import { DatasetState } from '../reducers/dataset.reducer';

export const selectFeature = createFeatureSelector<DatasetState>('data');

export const selectDataset = createSelector(selectFeature, (state) => state);

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
