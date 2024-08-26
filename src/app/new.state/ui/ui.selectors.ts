import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  ChartData,
  SummaryStatistics,
  UIState,
  VariableForm,
} from './ui.interface';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
  selectVariablesWithCorrespondingGroups,
} from '../xml/xml.selectors';
import {
  selectDatasetAllVariableCategories,
  selectDatasetVariableCrossTabValues,
} from '../dataset/dataset.selectors';
import {
  buildTable,
  createRowAndCategoryLabels,
  createTable,
  matchCategoriesWithLabels,
  transformCombinationsToChartData,
  truncatedText,
} from './util';

export const selectUIFeature = createFeatureSelector<UIState>('ui');

export const selectBodyToggleState = createSelector(
  selectUIFeature,
  (state) => state.bodyToggle,
);

export const selectOpenVariableID = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.openVariable.variableID,
);

export const selectOpenVariableName = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  (id, variables) => {
    return variables[id]?.['@_name'] || '';
  },
);

export const selectOpenVariableMode = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.openVariable.mode,
);

export const selectOpenVariableInCrossTabSelection = createSelector(
  selectUIFeature,
  (state) => {
    const selection = Object.values(state.bodyState.crossTab.selection);
    const openVariable = state.bodyState.variables.openVariable.variableID;
    let inCrossTab = false;
    for (const value of selection) {
      if (value.variableID === openVariable) {
        inCrossTab = true;
        break;
      }
    }
    return inCrossTab;
  },
);

export const selectCurrentGroupID = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.groupSelectedID,
);

export const selectVariablesCategoriesMissing = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.categoriesDeclaredMissing,
);

export const selectCrossTabCategoriesMissing = createSelector(
  selectUIFeature,
  (state) => state.bodyState.crossTab.missingCategories,
);

export const selectImportComponentState = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.importComponentState,
);

const selectOpenVariableGroups = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  selectDatasetProcessedGroups,
  selectVariablesWithCorrespondingGroups,
  (variableID, variables, processedGroups, correspondingGroups) => {
    const groups: { [groupID: string]: string }[] = [];
    if (correspondingGroups[variableID]) {
      correspondingGroups[variableID].map((value) =>
        groups.push({ [value]: processedGroups[value].labl || 'NO LABEL' }),
      );
    }
    return groups;
  },
);

export const selectOpenVariableCategoriesMissing = createSelector(
  selectOpenVariableID,
  selectVariablesCategoriesMissing,
  (openVariableID, selectCategories) => {
    const missingCategories: string[] = [];
    if (selectCategories[openVariableID]) {
      return selectCategories[openVariableID];
    }
    return missingCategories;
  },
);

export const selectVariableSelectionContext = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.variableSelectionContext,
);

export const selectOpenVariableHasCategories = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  (openID, variables) => {
    return !!variables[openID]?.catgry;
  },
);

export const selectOpenVariableChartTable = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  selectOpenVariableCategoriesMissing,
  (variableID, variables, missing) => {
    const chart: ChartData = {};
    let totalCount = 0;
    let totalWeightCount = 0;
    variables[variableID]?.catgry?.map((value) => {
      let count: string = 'None';
      let weightedCount: string = 'None';
      if (Array.isArray(value.catStat)) {
        value.catStat.map((state) => {
          if (state['@_wgtd']) {
            weightedCount = state['#text'] as string;
            totalWeightCount += state['#text'] as number;
          } else {
            count = state['#text'] as string;
            totalCount += state['#text'] as number;
          }
        });
      } else {
        if (value.catStat['@_wgtd']) {
          weightedCount = value.catStat['#text'] as string;
          totalWeightCount += value.catStat['#text'] as number;
        } else {
          count = value.catStat['#text'] as string;
          totalCount += value.catStat['#text'] as number;
        }
      }
      chart[value.catValu] = {
        category: value.labl?.['#text'] ? value.labl['#text'] : 'NO LABEL',
        count,
        weightedCount,
        countPercent: 0,
        weightedCountPercent: 0,
        invalid: missing.includes(value.catValu.toString()),
      };
    });
    Object.values(chart).forEach((value) => {
      value.countPercent =
        (Number(value.count) / totalCount) * 100 || Number.NEGATIVE_INFINITY;
      value.weightedCountPercent =
        (Number(value.weightedCount) / totalWeightCount) * 100 ||
        Number.NEGATIVE_INFINITY;
    });
    return chart;
  },
);

export const selectOpenVariableChart = createSelector(
  selectOpenVariableChartTable,
  selectOpenVariableCategoriesMissing,
  (table, invalid) => {
    const chart: { x: number; y: string }[] = [];
    Object.values(table).map((values, index) => {
      const value = Object.keys(table)[index];
      if (!invalid.includes(value)) {
        chart.push({
          x: Number(values.count),
          y: truncatedText(values.category),
        });
      }
    });
    return chart;
  },
);

export const selectOpenVariableChartReference = createSelector(
  selectOpenVariableChart,
  selectOpenVariableChartTable,
  (chart, table) => {
    const emptyValue: string[] = [];
    if (chart) {
      Object.values(table).map(({ category }) => {
        emptyValue.push(category);
      });
    }
    return emptyValue;
  },
);

export const selectOpenVariableFormState = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  selectOpenVariableGroups,
  (variableID, processedVariables, groups) => {
    let formState: VariableForm = { isWeight: false, groups: [] };
    if (processedVariables[variableID]) {
      const notesArray = processedVariables[variableID]?.notes;
      let notes = '';
      if (Array.isArray(notesArray)) {
        notesArray.map((item) => {
          if (typeof item === 'string') {
            notes = item;
          }
        });
      }
      formState = {
        isWeight: !!processedVariables[variableID]['@_wgt'],
        groups: groups,
        label: processedVariables[variableID].labl?.['#text'] || '',
        literalQuestion: processedVariables[variableID].qstn?.qstnLit || '',
        interviewQuestion: processedVariables[variableID].qstn?.ivuInstr || '',
        postQuestion: processedVariables[variableID].qstn?.postQTxt || '',
        universe: processedVariables[variableID].universe,
        notes,
        assignedWeight: processedVariables[variableID]['@_wgt-var'],
      };
    }
    return formState;
  },
);

export const selectOpenVariableSummaryStatistics = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  selectDatasetProcessedGroups,
  (variableID, processedVariables) => {
    const summaryStatistics: SummaryStatistics = {
      mode: '',
      minimum: '',
      standardDeviation: '',
      median: '',
      mean: '',
      maximum: '',
      totalValidCount: '',
      totalInvalidCount: '',
    };
    if (processedVariables[variableID]?.sumStat) {
      processedVariables[variableID]?.sumStat.map((value) => {
        switch (value['@_type']) {
          case 'mean':
            summaryStatistics.mean = value['#text'] as string;
            break;
          case 'mode':
            summaryStatistics.mode = value['#text'] as string;
            break;
          case 'medn':
            summaryStatistics.median = value['#text'] as string;
            break;
          case 'invd':
            summaryStatistics.totalInvalidCount = value['#text'] as string;
            break;
          case 'min':
            summaryStatistics.minimum = value['#text'] as string;
            break;
          case 'stdev':
            summaryStatistics.standardDeviation = value['#text'] as string;
            break;
          case 'max':
            summaryStatistics.maximum = value['#text'] as string;
            break;
          case 'vald':
            summaryStatistics.totalValidCount = value['#text'] as string;
            break;
        }
      });
    }
    return summaryStatistics;
  },
);

export const selectCrossTabSelection = createSelector(
  selectUIFeature,
  (state) => state.bodyState.crossTab.selection || [],
);

export const selectMatchCategories = createSelector(
  selectDatasetAllVariableCategories,
  selectDatasetVariableCrossTabValues,
  selectCrossTabCategoriesMissing,
  (allCategories, crossTabValues, missingCategories) => {
    return matchCategoriesWithLabels(
      allCategories,
      crossTabValues,
      missingCategories,
    );
  },
);

export const selectCrossTabulationTableData = createSelector(
  selectCrossTabSelection,
  selectMatchCategories,
  selectDatasetProcessedVariables,
  (crossTabSelection, processedAndMatchedCategories, variables) => {
    const rowAndColumnLabels = createRowAndCategoryLabels(
      crossTabSelection,
      variables,
    );
    const { labels, rows, cols } = rowAndColumnLabels;
    const table = createTable(processedAndMatchedCategories, labels);
    const removeEmptyValuesFromTable: { [id: string]: string }[] = [];
    table.map((item) => {
      if (Object.keys(item).length) {
        removeEmptyValuesFromTable.push(item);
      }
    });
    const empty: {
      table: { [id: string]: string }[];
      rows: string[];
      cols: string[];
    } = {
      table: [],
      cols: [],
      rows: [],
    };
    return !!removeEmptyValuesFromTable.length
      ? { table: removeEmptyValuesFromTable, rows, cols }
      : empty;
  },
);

export const selectCrossCharts = createSelector(
  selectCrossTabulationTableData,
  (crossTabData) => {
    const crossChart: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
      }[];
    } = {
      labels: [],
      datasets: [],
    };

    const countedCombinations = buildTable(crossTabData);
    const chartData = transformCombinationsToChartData(countedCombinations);

    return chartData || crossChart;
  },
);
