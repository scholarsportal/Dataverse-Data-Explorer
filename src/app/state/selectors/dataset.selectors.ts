import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DatasetState } from '../reducers/dataset.reducer';
import { Variable } from '../interface';

export const selectDatasetFeature = createFeatureSelector<DatasetState>('data');

export const selectDatasetState = createSelector(
  selectDatasetFeature,
  (state) => state,
);

export const selectDataset = createSelector(
  selectDatasetFeature,
  (state) => state.dataset,
);

export const selectDatasetForUpload = createSelector(
  selectDatasetFeature,
  (state) => {
    return {
      dataset: state.dataset,
      fileID: state.fileID,
      siteURL: state.siteURL,
      apiKey: state.apiKey,
    };
  },
);

export const selectDatasetLoading = createSelector(
  selectDatasetFeature,
  (state) => state.status,
);

export const selectDatasetUploadFailed = createSelector(
  selectDatasetState,
  (state) => state.uploadStatus?.error,
);

export const selectDatasetUploadSuccess = createSelector(
  selectDatasetState,
  (state) => state.uploadStatus?.success,
);

export const selectDatasetTitle = createSelector(
  selectDatasetState,
  (state) => {
    return state.dataset?.codeBook.stdyDscr.citation.titlStmt.titl;
  },
);

export const selectDatasetCitation = createSelector(
  selectDatasetState,
  (state) => state.dataset?.codeBook.stdyDscr.citation.biblCit,
);

export const selectDatasetVariableGroups = createSelector(
  selectDatasetState,
  (state) => state.dataset?.codeBook.dataDscr.varGrp,
);

export const selectDatasetVariables = createSelector(
  selectDatasetState,
  (state) => state.dataset?.codeBook.dataDscr.var,
);

export const selectDatasetProcessedVariables = createSelector(
  selectDatasetVariables,
  (variables) => {
    const processedVariables: { [variableID: string]: Variable } = {};
    variables?.map((value) => {
      processedVariables[value['@_ID']] = value;
    });
    return processedVariables;
  },
);
