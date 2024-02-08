import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from '../reducers/ui.reducer';
import { selectDatasetVariables } from './dataset.selectors';
import {
  selectVariableWeights,
  selectVariablesWithGroupsReference,
} from './var-groups.selectors';
import { VariableForm, initVariableForm } from '../interface';
export const selectUIFeature = createFeatureSelector<UIState>('ui');

export const selectIsOptionsMenuOpen = createSelector(
  selectUIFeature,
  (state) => state.modal.open && state.modal.mode === 'options'
);

export const selectOpenVariableModalMode = createSelector(
  selectUIFeature,
  (state) => state.modal.mode
);

export const selectOpenVariableID = createSelector(
  selectUIFeature,
  (state) => state.modal.variableID
);

export const selectOpenVariableData = createSelector(
  selectOpenVariableID,
  selectDatasetVariables,
  (variableID, datasetVariables) => {
    if (datasetVariables && variableID) {
      return datasetVariables[variableID];
    }
    return;
  }
);

export const selectOpenVariableDataID = createSelector(
  selectOpenVariableData,
  (variable) => {
    return variable?.['@_ID'];
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
      return variablesWithGroups[openVariableID].groups;
    }
    return [];
  }
);

export const selectOpenVariableDataAsForm = createSelector(
  selectOpenVariableID,
  selectDatasetVariables,
  (variableID, datasetVariables) => {
    const formData: VariableForm = initVariableForm;
    if (datasetVariables && variableID) {
      formData.id = datasetVariables[variableID]['@_ID'];
      formData.label = datasetVariables[variableID].labl['#text'];
      formData.literalQuestion = datasetVariables[variableID].qstn?.qstnLit;
      formData.interviewQuestion =
        datasetVariables[variableID].qstn?.ivuInstr || '';
      formData.postQuestion = datasetVariables[variableID].qstn?.postQTxt || '';
      formData.universe = datasetVariables[variableID].universe || '';
      formData.notes = datasetVariables[variableID].notes['#text'] || '';
      formData.weight = datasetVariables[variableID]['@_wgt-var'] || '';
      formData.isWeight = datasetVariables[variableID]['@_wgt'] ? true : false;
      return formData;
    }
    return;
  }
);

export const selectOpenVariableWeight = createSelector(
  selectOpenVariableID,
  selectDatasetVariables,
  (openVarID, datasetVariables) => {
    if (openVarID && datasetVariables) {
      return datasetVariables[datasetVariables[openVarID]['@_wgt-var']];
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
    if (variable?.catgry) {
      variable.catgry.map((variableCategory) => {
        chart[variableCategory.catValu] = {
          ...chart[variableCategory.catValu],
          values: variableCategory.catValu,
          categories: variableCategory.labl['#text'],
          count: variableCategory.catStat[0]['#text'],
          countWeighted: variableCategory.catStat[1]['#text'],
          valid: true,
        };
        total += variableCategory.catStat[0]['#text'] as number;
      });
      variable.catgry.map((variableCategory) => {
        chart[variableCategory.catValu].countPercent =
          ((variableCategory.catStat[0]['#text'] as number) / total) * 100;
      });
    }
    return chart;
  }
);

export const selectOpenVariableDataChart = createSelector(
  selectOpenVariableDataChartTable,
  (state) => {
    const chartData: { y: string; x: number | null }[] = [];
    Object.values(state).map((value) =>
      chartData.push({
        y: value.categories,
        x: parseFloat(value.count as string) || 0,
      })
    );
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
