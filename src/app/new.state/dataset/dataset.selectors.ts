import { DatasetState } from './dataset.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  selectDatasetProcessedVariables,
  selectDatasetVariableGroups,
  selectDatasetVariables
} from '../xml/xml.selectors';
import { Variable } from '../xml/xml.interface';

export const selectDatasetFeature =
  createFeatureSelector<DatasetState>('dataset');

export const selectDatasetDownloadPending = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.download === 'pending'
);

export const selectDatasetDownloadedSuccessfully = createSelector(
  selectDatasetFeature,
  selectDatasetVariables,
  selectDatasetVariableGroups,
  (state, variables, groups) => {
    return !!(
      state.operationStatus.download === 'success' &&
      variables?.length &&
      groups?.length
    );
  }
);

export const selectDatasetUploadedSuccessfully = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.upload === 'success'
);

export const selectDatasetUploadError = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.upload === 'error'
);

export const selectDatasetImportIdle = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'idle'
);

export const selectDatasetImportPending = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'pending'
);

export const selectDatasetImportSuccess = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'success'
);

export const selectDatasetWeights = createSelector(
  selectDatasetProcessedVariables,
  (variables) => {
    const weights: { [id: string]: string } = {};

    if (variables) {
      Object.values(variables).map((variable: Variable) => {
        const wgtVar = variable['@_wgt-var'] as string | undefined;
        if (wgtVar && variables[wgtVar]) {
          weights[wgtVar] = variables[wgtVar].labl['#text'];
        }
      });
    }

    return weights;
  }
);

export const selectDatasetVariableCrossTabValues = createSelector(
  selectDatasetFeature,
  (state) => {
    return state.crossTabulation;
  }
);

export const selectVariableCrossTabIsFetching = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.variableDownload === 'pending'
);

export const selectDatasetAllVariableCategories = createSelector(
  selectDatasetProcessedVariables,
  (variables) => {
    const categories: {
      [variableID: string]: { [categoryID: string]: string };
    } = {};
    Object.values(variables)?.map((variable) => {
      categories[variable['@_ID']] = {};
      if (variable.catgry && Array.isArray(variable.catgry)) {
        // console.log(variable.catgry);
        variable.catgry.map((cat) => {
          categories[variable['@_ID']] = {
            ...categories[variable['@_ID']],
            [cat.catValu]: cat.labl?.['#text'] ? cat.labl['#text'] : ''
          };
        });
      }
    });
    return categories;
  }
);
