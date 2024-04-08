import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CrossTabulationState } from '../reducers/cross-tabulation.reducer';
import { selectDatasetProcessedCategories, selectDatasetProcessedVariables } from './dataset.selectors';

export const selectCrossTabulationFeature =
  createFeatureSelector<CrossTabulationState>('cross-tabulation');

export const selectIsCrossTabOpen = createSelector(
  selectCrossTabulationFeature,
  (state) => state.open
);

export const selectVariablesMetadata = createSelector(
  selectCrossTabulationFeature,
  (state) => state.variablesMetadata
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
  selectCrossTabulationFeature,
  selectDatasetProcessedVariables,
  selectedVariablesInCrossTab,
  selectVariablesMetadata, (state, processedVariables, selectedVariables, metadata) => {
    const missing: { [id: string]: string[] } = {};
    Object.values(processedVariables).map((value) => {
      missing[value['@_ID']] = metadata[value['@_ID']]?.missing || [];
    });
    return missing;
  }
);

export const selectMatchedCategories = createSelector(selectVariablesMetadata,
  selectDatasetProcessedCategories,
  (metadata, processedCategories) => {
    const matched: { [variableID: string]: string[] } = {};
    Object.keys(metadata).map((key) => {
      const values: string[] = [];
      if (processedCategories[key]) {
        metadata[key].crossTabValues?.map((value) => {
          const toPush = processedCategories[key][value] || '';
          values.push(toPush);
        });
      }
      matched[key] = values;
    });
    return matched;
  });

export const selectCurrentCrossTableData = createSelector(
  selectedVariablesInCrossTab,
  selectMatchedCategories,
  selectDatasetProcessedVariables,
  (variablesInCrossTab, processedCategoryInDataset, processedVariables) => {
    const data: { [categoryLabel: string]: string }[] = [];
    Object.values(variablesInCrossTab).map((item) => {
      const variableID = item.variableID;
      const singleDataValue: { [categoryLabel: string]: string } = {};
      processedCategoryInDataset[variableID]?.map((val) => {
        const label = `${processedVariables[variableID]['@_name']} - ${processedVariables[variableID].labl['#text']}`;
        singleDataValue[val] = label;
      });
      data.push(singleDataValue);
    });
    console.log(data);
    return data;
  }
);

export const selectCurrentCrossTableVariables = createSelector(
  selectCrossTabulationFeature,
  (state) => {
    return state.variablesMetadata;
  }
);
