import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CrossTabulationState } from '../reducers/cross-tabulation.reducer';
import {
  selectDatasetProcessedVariables,
  selectDatasetVariables,
} from './dataset.selectors';

export const selectCrossTabulationFeature =
  createFeatureSelector<CrossTabulationState>('cross-tabulation');

export const selectRows = createSelector(
  selectCrossTabulationFeature,
  (state) => state.rows,
);

export const selectColumns = createSelector(
  selectCrossTabulationFeature,
  (state) => state.columns,
);

export const selectAvailableVariables = createSelector(
  selectDatasetProcessedVariables,
  selectRows,
  selectColumns,
  (variables, rows, columns) => {
    const newData = { ...variables };
    const currentSelectedVariables = [
      ...Object.values(rows),
      ...Object.values(columns),
    ];
    currentSelectedVariables.map((variable) => {
      newData[variable.variableID] ?? delete newData[variable.variableID];
    });
    return newData;
  },
);

export const selectCurrentCrossTableData = createSelector(
  selectRows,
  selectColumns,
  selectDatasetProcessedVariables,
  (rowVariables, columnVariables, dataset) => {
    const table: any[] = [];
    const rows: string[] = [];
    const columns: string[] = [];
    var tableLength: number = 0;

    // Create row labels and add to tableLength
    Object.keys(rowVariables).map((variableID) => {
      if (dataset[variableID]) {
        rows.push(
          dataset[variableID]['@_name'] +
            ' - ' +
            dataset[variableID].labl['#text'],
        );
      }
      if (dataset[variableID]?.catgry?.length > tableLength) {
        tableLength = dataset[variableID].catgry.length;
      }
    });

    // Create columns labels and add to tableLength
    Object.keys(columnVariables).map((variableID) => {
      if (dataset[variableID]) {
        columns.push(
          dataset[variableID]['@_name'] +
            ' - ' +
            dataset[variableID].labl['#text'],
        );
      }
      if (dataset[variableID]?.catgry?.length) {
        tableLength += dataset[variableID].catgry.length;
      }
    });

    // Create Table
    // Rows
    Object.keys(rowVariables).map((variableID) => {
      if (dataset[variableID]?.catgry) {
        dataset[variableID].catgry.map((category, index) => {
          const newTableEntry: any = {};
          const row = dataset[variableID];
          const rowTitle = row['@_name'] + ' - ' + row.labl['#text'];
          const catStat = category.catStat;
          newTableEntry[rowTitle] = Array.isArray(catStat)
            ? catStat[0]['#text']
            : catStat['#text'];
          if (dataset[Object.keys(columnVariables)[index]]?.catgry.length) {
            const col = dataset[Object.keys(columnVariables)[index]];
            const colTitle = col['@_name'] + ' - ' + col.labl['#text'];
            col.catgry.map((category) => {
              newTableEntry[colTitle] = Array.isArray(category.catStat)
                ? category.catStat[0]['#text']
                : category.catStat['#text'];
            });
          }
          table.push(newTableEntry);
        });
      }
    });

    // Columns
    Object.keys(columnVariables).map((variableID) => {
      const variable = dataset[variableID];
      if (variable?.catgry.length) {
        variable.catgry.map((category, index) => {
          const newTableEntry: any = {};
          const colTitle = variable['@_name'] + ' - ' + variable.labl['#text'];
          const catStat = category.catStat;
          newTableEntry[colTitle] = Array.isArray(catStat)
            ? catStat[0]['#text']
            : catStat['#text'];

          if (dataset[Object.keys(rowVariables)[index]]?.catgry.length) {
            const row = dataset[Object.keys(rowVariables)[index]];
            const rowTitle = row['@_name'] + ' - ' + row.labl['#text'];
            row.catgry.map((category) => {
              newTableEntry[rowTitle] = Array.isArray(category.catStat)
                ? category.catStat[0]
                : category.catStat['#text'];
            });
          }
          table.push(newTableEntry);
        });
      }
    });
    return [];
  },
);
