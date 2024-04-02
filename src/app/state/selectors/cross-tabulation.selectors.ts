import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CrossTabulationState} from '../reducers/cross-tabulation.reducer';
import {selectDatasetProcessedVariables} from './dataset.selectors';
import {Variable} from "../interface";

export const selectCrossTabulationFeature =
  createFeatureSelector<CrossTabulationState>('cross-tabulation');

export const selectIsCrossTabOpen = createSelector(
  selectCrossTabulationFeature,
  (state) => state.open,
);

export const selectRows = createSelector(
  selectCrossTabulationFeature,
  (state) => state.rows,
);

export const selectRowsArray = createSelector(
  selectCrossTabulationFeature,
  (state) => Object.values(state.rows),
);

export const selectColumns = createSelector(
  selectCrossTabulationFeature,
  (state) => state.columns,
);

export const selectColumnsArray = createSelector(
  selectCrossTabulationFeature,
  (state) => Object.values(state.columns),
);

function addCategoryValues(categories: {
  [p: string]: { missing: string[]; categories: { [p: string]: string } }
}, variables: { [p: string]: Variable }) {
  const categoriesTemp = categories
  Object.keys(categoriesTemp).map((key) => {
    const catgry = variables[key]?.catgry
    if (catgry) {
      catgry.map(({catValu, labl}) => {
        categoriesTemp[key] = {
          ...categoriesTemp[key],
          categories: {
            ...categoriesTemp[key].categories,
            [String(catValu)]: labl["#text"]
          }
        }
      })
    }
  })
  return categoriesTemp;
}

function addEachCategoryMissingValues(categories: {
  [variableID: string]: { missing: string[]; categories: { [categoryValue: string]: string; }; };
}, columns: { variableID: string; missingCategories: string[]; }[]) {
  const categoriesTemp = categories
  Object.values(columns).map((value) => {
    categoriesTemp[value.variableID] = {
      categories: {},
      missing: value.missingCategories
    }
  })
  return categoriesTemp;
}

export const selectVariableRowsCategories = createSelector(
  selectDatasetProcessedVariables, selectRows, (variables, rows) => {
    const categories: {
      [variableID: string]: { missing: string[], categories: { [categoryValue: string]: string } }
    } = {}
    // Add Missing Values
    Object.values(rows).map((value) => {
      categories[value.variableID] = {
        categories: {},
        missing: value.missingCategories
      }
    })
    const categoriesWithValues = addCategoryValues(categories, variables);
    return categoriesWithValues
  }
)

export const selectVariableColumnsCategories = createSelector(
  selectDatasetProcessedVariables, selectColumnsArray, (variables, columns) => {
    const categories: {
      [variableID: string]: { missing: string[], categories: { [categoryValue: string]: string } }
    } = {}
    // Add Missing Values
    const categoriesWithMissingValues = addEachCategoryMissingValues(categories, columns);
    const categoriesWithValues = addCategoryValues(categories, variables);
    return categoriesWithValues
  }
)

export const selectCurrentCrossTableData = createSelector(
  selectRows,
  selectColumns,
  selectDatasetProcessedVariables,
  (rowVariables, columnVariables, dataset) => {
    return []
  },
);

