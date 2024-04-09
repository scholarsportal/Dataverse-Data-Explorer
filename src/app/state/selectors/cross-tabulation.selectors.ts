import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CrossTabulationState } from '../reducers/cross-tabulation.reducer';
import { selectDatasetProcessedCategories, selectDatasetProcessedVariables } from './dataset.selectors';
import { Variable } from '../interface';

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
            let label = '';
            if (category.labl?.['#text']) {
              label = category.labl['#text'];
            }
            categories[value['@_ID']] = {
              ...categories[value['@_ID']],
              [String(category.catValu)]: label
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
    const rowsAndColumns: { row: string[], column: string[] } = separateRowsAndCategories(variablesInCrossTab);
    const rowAndColumnLabels: {
      [variableID: string]: string
    } = createRowAndCategoryLabels(variablesInCrossTab, processedVariables);
    // Loop through the current labels
    Object.keys(processedCategoryInDataset).map((key: string) => {
      const item = processedCategoryInDataset[key];
      item.map((categoryLabel, index) => {
        if (categoryLabel !== '') {
          if (data[index]) {
            data[index] = {
              ...data[index],
              [rowAndColumnLabels[key]]: categoryLabel
            };
          } else {
            data[index] = { [rowAndColumnLabels[key]]: categoryLabel };
          }
        } else {
          data[index] = {};
        }
      });
    });
    const newData: { [id: string]: string }[] = [];
    data.map((item, index) => {
      if (Object.keys(item).length) {
        newData.push(item);
      }
    });
    return newData;
  }
);

export const selectRowsAndCategories = createSelector(
  selectCrossTabulationFeature, selectDatasetProcessedVariables, selectVariablesMetadata, (state, processedVariables, variablesMetadata) => {
    const rowsAndColumns: { row: string[], column: string[] } = { row: [], column: [] };
    const rowAndColumnLabels = createRowAndCategoryLabels(state.selectedVariables, processedVariables);
    Object.values(state.selectedVariables).map(value => {
      if (rowAndColumnLabels[value.variableID] && rowAndColumnLabels[value.variableID] !== 'var-not-found') {
        rowsAndColumns[value.orientation].push(rowAndColumnLabels[value.variableID]);
      }
    });
    return rowsAndColumns;
  }
);

function separateRowsAndCategories(variables: { [p: number]: { orientation: 'row' | 'column'; variableID: string } }) {
  const rowsAndCategories: { column: string[], row: string[] } = { column: [], row: [] };
  Object.values(variables).map(item => {
    rowsAndCategories[item.orientation].push(item.variableID);
  });
  return rowsAndCategories;
}

function createRowAndCategoryLabels(variablesInCrossTab: {
  [p: number]: { orientation: 'row' | 'column'; variableID: string }
}, processedVariables: { [p: string]: Variable }): { [variableID: string]: string } {
  const labels: { [variableID: string]: string } = {};
  Object.values(variablesInCrossTab).map((item) => {
    const processed = processedVariables[item.variableID] || null;
    const newLabel = processed ? `${processed['@_name']} - ${processed.labl?.['#text'] || 'no-label'}` : 'var-not-found';
    labels[item.variableID] = newLabel;
  });
  return labels;
}
