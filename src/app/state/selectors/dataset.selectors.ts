import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DatasetState } from '../reducers/dataset/dataset.reducer';
import { Variable } from '../interface';

export const selectDatasetFeature = createFeatureSelector<DatasetState>('data');

export const selectDatasetState = createSelector(
  selectDatasetFeature,
  (state) => state
);

export const selectDataset = createSelector(
  selectDatasetFeature,
  (state) => state.dataset
);

export const selectDatasetHasAPIKey = createSelector(
  selectDatasetFeature,
  (state) => state.datasetInfo.apiKey !== undefined
);

export const selectDatasetInfo = createSelector(selectDatasetFeature, (dataset) => {
  const { fileID, siteURL, apiKey } = dataset.datasetInfo;
  if (fileID && siteURL && apiKey) {
    return { fileID, siteURL, apiKey };
  }
  return null;
});

export const selectFileID = createSelector(selectDatasetInfo, (info) => {
  return info?.fileID;
});

export const selectSiteURL = createSelector(selectDatasetInfo, (info) => {
  return info?.siteURL;
});

export const selectApiKey = createSelector(selectDatasetInfo, (info) => {
  return info?.apiKey;
});

export const selectDatasetForUpload = createSelector(
  selectDatasetFeature,
  (state) => {
    return {
      dataset: state.dataset,
      fileID: state.datasetInfo.fileID,
      siteURL: state.datasetInfo.siteURL,
      apiKey: state.datasetInfo.apiKey
    };
  }
);

export const selectDatasetLoading = createSelector(
  selectDatasetFeature,
  (state) => state.download.status
);

export const selectDatasetUploadFailed = createSelector(
  selectDatasetState,
  (state) => state.upload.status === 'error'
);

export const selectDatasetUploadSuccess = createSelector(
  selectDatasetState,
  (state) => state.upload.status === 'success'
);

export const selectDatasetTitle = createSelector(
  selectDatasetState,
  (state) => {
    return state.dataset?.codeBook.stdyDscr.citation.titlStmt.titl;
  }
);

export const selectDatasetCitation = createSelector(
  selectDatasetState,
  (state) => state.dataset?.codeBook.stdyDscr.citation.biblCit
);

export const selectDatasetVariableGroups = createSelector(
  selectDatasetState,
  (state) => state.dataset?.codeBook?.dataDscr.varGrp ?? []
);

export const selectDatasetVariables = createSelector(
  selectDatasetState,
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

export const selectDatasetImportInProgress = createSelector(
  selectDatasetState,
  (state) => state.import.status === 'pending'
);

export const selectDatasetImportNotStarted = createSelector(
  selectDatasetState,
  (state) => state.import.status === 'idle'
);

export const selectDatasetImportSuccess = createSelector(
  selectDatasetState,
  (state) => state.import.status === 'success'
);
