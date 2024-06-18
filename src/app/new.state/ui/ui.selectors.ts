import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChartData, SummaryStatistics, UIState, VariableForm } from './ui.interface';
import {
  selectDatasetProcessedGroups,
  selectDatasetProcessedVariables,
  selectVariablesWithCorrespondingGroups
} from '../xml/xml.selectors';
import { selectDatasetAllVariableCategories, selectDatasetVariableCrossTabValues } from '../dataset/dataset.selectors';
import { createRowAndCategoryLabels, createTable, matchCategoriesWithLabels, truncatedText } from './util';

export const selectUIFeature = createFeatureSelector<UIState>('ui');

export const selectBodyToggleState = createSelector(
  selectUIFeature,
  (state) => state.bodyToggle
);

export const selectOpenVariableID = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.openVariable.variableID
);

export const selectOpenVariableName = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  (id, variables) => {
    return variables[id]?.['@_name'] || '';
  }
);

export const selectOpenVariableMode = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.openVariable.mode
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
  }
);

export const selectCurrentGroupID = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.groupSelectedID
);

export const selectVariablesCategoriesMissing = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.categoriesDeclaredMissing
);

export const selectCrossTabCategoriesMissing = createSelector(
  selectUIFeature,
  (state) => state.bodyState.crossTab.missingCategories
);

export const selectImportComponentState = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.importComponentState
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
        groups.push({ [value]: processedGroups[value].labl || 'NO LABEL' })
      );
    }
    return groups;
  }
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
  }
);

export const selectVariableSelectionContext = createSelector(
  selectUIFeature,
  (state) => state.bodyState.variables.variableSelectionContext
);

export const selectOpenVariableHasCategories = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  (openID, variables) => {
    return !!variables[openID]?.catgry;
  }
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
      let count = Number.MAX_SAFE_INTEGER;
      let weightedCount = Number.MAX_SAFE_INTEGER;
      if (Array.isArray(value.catStat)) {
        value.catStat.map((state) => {
          if (state['@_wgtd']) {
            weightedCount = state['#text'] as number;
            totalWeightCount += state['#text'] as number;
          } else {
            count = state['#text'] as number;
            totalCount += state['#text'] as number;
          }
        });
      } else {
        if (value.catStat['@_wgtd']) {
          weightedCount = value.catStat['#text'] as number;
          totalWeightCount += value.catStat['#text'] as number;
        } else {
          count = value.catStat['#text'] as number;
          totalCount += value.catStat['#text'] as number;
        }
      }
      chart[value.catValu] = {
        category: value.labl?.['#text'] ? value.labl['#text'] : 'NO LABEL',
        count,
        weightedCount,
        countPercent: 0,
        weightedCountPercent: 0,
        invalid: missing.includes(value.catValu.toString())
      };
    });
    Object.values(chart).forEach((value) => {
      value.countPercent = (value.count / totalCount) * 100;
      value.weightedCountPercent =
        (value.weightedCount / totalWeightCount) * 100;
    });
    return chart;
  }
);

export const selectOpenVariableChart = createSelector(
  selectOpenVariableChartTable,
  selectOpenVariableCategoriesMissing,
  (table, invalid) => {
    const chart: { x: number; y: string }[] = [];
    Object.values(table).map((values, index) => {
      const value = Object.keys(table)[index];
      if (!invalid.includes(value)) {
        chart.push({ x: values.count, y: truncatedText(values.category) });
      }
    });
    return chart;
  }
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
        notesArray.map(item => {
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
        assignedWeight: processedVariables[variableID]['@_wgt-var']
      };
    }
    return formState;
  }
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
      totalInvalidCount: ''
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
  }
);

export const selectCrossTabSelection = createSelector(
  selectUIFeature,
  (state) => state.bodyState.crossTab.selection || []
);

export const selectMatchCategories = createSelector(
  selectDatasetAllVariableCategories,
  selectDatasetVariableCrossTabValues,
  selectCrossTabCategoriesMissing,
  (allCategories, crossTabValues, missingCategories) => {
    const data = matchCategoriesWithLabels(
      allCategories,
      crossTabValues,
      missingCategories
    );
    return data;
  }
);

/* istanbul ignore next */
export const selectCrossTabulationTableData = createSelector(
  selectCrossTabSelection,
  selectMatchCategories,
  selectDatasetProcessedVariables,
  (crossTabSelection,
   processedAndMatchedCategories,
   variables) => {
    let rowAndColumnLabels: { labels: { [variableID: string]: string }, rows: string[], cols: string[] } = {
      labels: {},
      cols: [],
      rows: []
    };
    rowAndColumnLabels = createRowAndCategoryLabels(
      crossTabSelection,
      variables
    );
    const { labels, rows, cols } = rowAndColumnLabels;
    const table = createTable(processedAndMatchedCategories, labels);
    const removeEmptyValuesFromTable: { [id: string]: string }[] = [];
    table.map((item) => {
      if (Object.keys(item).length) {
        removeEmptyValuesFromTable.push(item);
      }
    });
    return { table: removeEmptyValuesFromTable, rows, cols };
  }
);

export const selectCrossCharts = createSelector(
  selectDatasetProcessedVariables, selectCrossTabCategoriesMissing, selectCrossTabSelection, selectMatchCategories, (variables, missing, crossTabSelection, tableData) => {
    const crossChart: {
      datasets: {
        label: string,
        data: {
          [label: string]: number
        },
      }[],
    } = {
      datasets: []
    };
    const varReference: { [variableID: string]: { [labelID: string]: string } } = {};

    const tempChart: { [label: string]: number } = {};
    const first = Object.values(tableData)?.[0] || [];
    const second = Object.values(tableData)?.[1] || [];
    first?.map((value, index) => {
      if (value !== '') {
        let label = second.length ? value + ' - ' + second[index] : value;
        if (Object.values(tableData).length > 1) {
          let newVal = '';
          Object.values(tableData).map((value, index) => {
            newVal = newVal + ' - ' + value[index];
          });
          label = label + newVal;
        }
        if (tempChart[label]) {
          tempChart[label] += 1;
        } else {
          tempChart[label] = 1;
        }
      }
    });

    console.log(tempChart);

    crossTabSelection.map((value) => {
      if (!!value.variableID) {
        const data: { [label: string]: number } = {};
        variables[value.variableID]?.catgry?.map(cat => {
          data[cat.catValu] = Array.isArray(cat.catStat) ? cat.catStat[0]['#text'] as number : cat.catStat['#text'] as number;
          if (varReference[value.variableID]) {
            varReference[cat.catValu] = {
              ...varReference[cat.catValu],
              [cat.catValu]: cat.labl['#text']
            };
          } else {
            varReference[value.variableID] = {
              [cat.catValu]: cat.labl['#text']
            };
          }
        });
        const label = variables[value.variableID]['@_name'] + ' - ' + variables[value.variableID].labl['#text'];
        crossChart.datasets.push({ label, data });
      }
    });

    console.log(crossChart.datasets);

    return crossChart;
  }
);

