import { DatasetState } from './dataset.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  selectDatasetProcessedVariables,
  selectDatasetVariables,
} from '../xml/xml.selectors';
import { Variable } from '../xml/xml.interface';

export const selectDatasetFeature =
  createFeatureSelector<DatasetState>('dataset');

export const selectDatasetDownloadPending = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.download === 'pending',
);

export const selectDatasetDownloadedSuccessfully = createSelector(
  selectDatasetFeature,
  selectDatasetVariables,
  (state, variables) => {
    return !!(
      state.operationStatus.download === 'success' && variables?.length
    );
  },
);

//** UPLOAD STATUS */
export const selectDatasetUploadedSuccessfully = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.upload === 'success',
);

export const selectDatasetUploadError = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.upload === 'error',
);

export const selectDatasetUploadPending = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.upload === 'pending',
);

//** SAVE STATUS */
export const selectDatasetSaveIdle = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.save === 'idle',
);

export const selectDatasetSavePending = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.save === 'pending',
);

export const selectDatasetSaveSuccess = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.save === 'success',
);

export const selectDatasetSaveError = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.save === 'error',
);

//** IMPORT STATUS */
export const selectDatasetImportIdle = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'idle',
);

export const selectDatasetImportPending = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'pending',
);

export const selectDatasetImportSuccess = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'success',
);

export const selectDatasetImportError = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.import === 'error',
);

//** WEIGHTS */

export const selectDatasetWeights = createSelector(
  selectDatasetProcessedVariables,
  (variables) => {
    const weights: { [id: string]: string } = {};

    if (variables) {
      Object.values(variables).map((variable: Variable) => {
        const wgtVar = variable['@_wgt'] as string | undefined;
        if (wgtVar) {
          weights[variable['@_ID']] = variable.labl?.['#text']
            ? variable.labl['#text']
            : `${variable['@_name']} - NO LABEL`;
        }
      });
    }

    return weights;
  },
);

export const selectDatasetVariableCrossTabValues = createSelector(
  selectDatasetFeature,
  (state) => {
    return state.crossTabulation;
  },
);

export const selectVariableCrossTabIsFetching = createSelector(
  selectDatasetFeature,
  (state) => state.operationStatus.variableDownload === 'pending',
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
            [cat.catValu]: cat.labl?.['#text'] ? cat.labl['#text'] : '',
          };
        });
      }
    });
    return categories;
  },
);
