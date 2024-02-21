import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OpenVariableState } from '../reducers/open-variable.reducer';
import {
  selectDatasetProcessedVariables,
  selectDatasetVariables,
} from './dataset.selectors';
import {
  selectCurrentVarList,
  selectVariablesWithGroupsReference,
} from './var-groups.selectors';
import { VariableForm, initVariableForm } from '../interface';
export const selectOpenVariableFeature =
  createFeatureSelector<OpenVariableState>('open-variable');

export const selectIsOptionsMenuOpen = createSelector(
  selectOpenVariableFeature,
  (state) => state.modal.open && state.modal.mode === 'options'
);

export const selectOpenVariableModalMode = createSelector(
  selectOpenVariableFeature,
  (state) => state.modal.mode
);

export const selectOpenVariableID = createSelector(
  selectOpenVariableFeature,
  (state) => state.modal.variableID
);

export const selectOpenVariableData = createSelector(
  selectOpenVariableID,
  selectDatasetProcessedVariables,
  (variableID, datasetVariables) => {
    if (datasetVariables && variableID) {
      return datasetVariables[variableID];
    }
    return null;
  }
);

export const selectOpenVariableStats = createSelector(
  selectOpenVariableData,
  (variable) => {
    return variable?.catgry;
  }
);

export const selectOpenVariableDataName = createSelector(
  selectOpenVariableData,
  (variable) => {
    return variable?.['@_name'];
  }
);

export const selectOpenVariableSelectedGroups = createSelector(
  selectOpenVariableID,
  selectVariablesWithGroupsReference,
  (openVariableID, variablesWithGroups) => {
    if (openVariableID && variablesWithGroups) {
      return variablesWithGroups[openVariableID]?.groups;
    }
    return [];
  }
);

export const selectOpenVariableDataAsForm = createSelector(
  selectOpenVariableData,
  (variable) => {
    const formData: VariableForm = initVariableForm;
    if (variable) {
      formData.id = variable['@_ID'];
      formData.label = variable.labl['#text'];
      formData.literalQuestion = variable.qstn?.qstnLit;
      formData.interviewQuestion = variable.qstn?.ivuInstr || '';
      formData.postQuestion = variable.qstn?.postQTxt || '';
      formData.universe = variable.universe || '';
      formData.notes = variable.notes['#text'] || '';
      formData.weight = variable['@_wgt-var'] || '';
      formData.isWeight = variable['@_wgt'] ? true : false;
      return formData;
    }
    return;
  }
);

export const selectOpenVariableWeight = createSelector(
  selectOpenVariableData,
  (variable) => {
    if (variable) {
      return variable['@_wgt-var'];
    }
    return null;
  }
);

export const selectOpenVariableDataChartTable = createSelector(
  selectOpenVariableData,
  (variable) => {
    const chart: {
      [id: number]: {
        values: number;
        categories: string;
        count: string | number;
        countPercent: number;
        valid: boolean;
        countWeighted?: string | number;
      };
    } = {};
    let total = 0;
    const categories = variable?.catgry;
    if (categories) {
      categories.forEach((variableCategory) => {
        const catValu = variableCategory.catValu;
        const labl = variableCategory.labl
          ? variableCategory.labl['#text']
          : 'No Label on Category';
        const count = Array.isArray(variableCategory.catStat)
          ? variableCategory.catStat[0]['#text']
          : variableCategory.catStat['#text'];
        const countWeighted = Array.isArray(variableCategory.catStat)
          ? variableCategory.catStat[1]['#text']
          : 0;

        chart[catValu] = {
          values: catValu,
          categories: labl,
          count,
          countWeighted,
          valid: true,
          countPercent: 0, // Initialize countPercent to 0
        };
        total += Number(count);
      });

      // Calculate countPercent for each category
      categories.forEach((variableCategory) => {
        const catValu = variableCategory.catValu;
        chart[catValu].countPercent =
          (Number(chart[catValu].count) / total) * 100;
      });
    }
    return chart;
  }
);

export const selectOpenVariableDataChart = createSelector(
  selectOpenVariableDataChartTable,
  (state) => {
    const chartData: { y: string; x: number | null }[] = [];
    if (state) {
      Object.values(state).map((value) =>
        chartData.push({
          y: value.categories,
          x: parseFloat(value.count as string) || 0,
        })
      );
    }
    return chartData;
  }
);

export const selectOpenVariableDataAsSummaryStat = createSelector(
  selectOpenVariableData,
  (variable) => {
    const sumStats: { key: string; value: string }[] = [];
    if (variable?.sumStat) {
      variable.sumStat.map((value) => {
        switch (value['@_type']) {
          case 'mean':
            sumStats.push({ key: 'Mean', value: value['#text'] as string });
            break;
          case 'mode':
            sumStats.push({ key: 'Mode', value: value['#text'] as string });
            break;
          case 'medn':
            sumStats.push({ key: 'Median', value: value['#text'] as string });
            break;
          case 'invd':
            sumStats.push({
              key: 'Total Invalid Count',
              value: value['#text'] as string,
            });
            break;
          case 'min':
            sumStats.push({ key: 'Minimum', value: value['#text'] as string });
            break;
          case 'stdev':
            sumStats.push({
              key: 'Standard Deviation',
              value: value['#text'] as string,
            });
            break;
          case 'max':
            sumStats.push({ key: 'Maximum', value: value['#text'] as string });
            break;
          case 'vald':
            sumStats.push({
              key: 'Total Valid Count',
              value: value['#text'] as string,
            });
            break;
        }
      });
      return sumStats;
    }
    return sumStats;
  }
);

export const selectGetNextVariableID = createSelector(
  selectOpenVariableData,
  selectCurrentVarList,
  (variable, currentVariableList) => {
    if (variable && currentVariableList) {
      const index = currentVariableList.indexOf(variable);
      if (index >= currentVariableList.length - 1) {
        return currentVariableList[0]['@_ID'];
      }
      return currentVariableList[index + 1]['@_ID'];
    }
    return;
  }
);

export const selectGetPreviousVariableID = createSelector(
  selectOpenVariableData,
  selectCurrentVarList,
  (variable, currentVariableList) => {
    if (variable && currentVariableList) {
      const index = currentVariableList.indexOf(variable);
      if (index <= 0) {
        return currentVariableList[currentVariableList.length - 1]['@_ID'];
      }
      return currentVariableList[index - 1]['@_ID'];
    }
    return;
  }
);
