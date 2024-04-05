import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CrossTabulationState } from '../reducers/cross-tabulation.reducer';
import { selectDatasetProcessedVariables } from './dataset.selectors';

export const selectCrossTabulationFeature =
  createFeatureSelector<CrossTabulationState>('cross-tabulation');

export const selectIsCrossTabOpen = createSelector(
  selectCrossTabulationFeature,
  (state) => state.open
);

export const selectedVariablesInCrossTab = createSelector(selectCrossTabulationFeature, (state) => {
  return state.selectedVariables;
});

export const selectCategoriesForSelectedVariables = createSelector(
  selectDatasetProcessedVariables, selectedVariablesInCrossTab,
  (processedVariablesInDataset, selectedVariables) => {
    const categories: { [variableID: string]: { [categoryID: string]: string } } = {};
    Object.values(processedVariablesInDataset).map((value) => {
      if (value.catgry) {
        if (Array.isArray(value.catgry)) {
          value.catgry.map((category) => {
            categories[value['@_ID']] = {
              ...categories[value['@_ID']],
              [String(category.catValu)]: category.labl['#text']
            };
          });
        }
      }
    });
    return categories;
  });

export const selectMissingCategoriesForSelectedVariables = createSelector(
  selectCrossTabulationFeature, selectDatasetProcessedVariables, selectedVariablesInCrossTab, (state, processedVariables, selectedVariables) => {
    const missing: { [id: string]: string[] } = {};
    Object.values(processedVariables).map((value) => {
      missing[value['@_ID']] = state.variablesMetadata[value['@_ID']]?.missing || [];
    });
    console.log(missing);
    return missing;
  }
);

export const selectCurrentCrossTableData = createSelector(
  selectedVariablesInCrossTab,
  selectDatasetProcessedVariables,
  (variablesInCrossTab, processedVariablesInDataset) => {
    return [];
  }
);

export const selectCurrentCrossTableVariables = createSelector(
  selectCrossTabulationFeature,
  (state) => {

    return state.variablesMetadata;
  }
);
