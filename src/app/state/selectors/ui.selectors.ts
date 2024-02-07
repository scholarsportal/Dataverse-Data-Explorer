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
  selectVariableWeights,
  selectOpenVariableSelectedGroups,
  (variableID, datasetVariables, variableWeights, groups) => {
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
      return { formData, variableWeights, groups };
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

export const selectOpenVariableDataAsChart = createSelector(
  selectOpenVariableData,
  (variable) => {
    const chart: {
      [id: number]: {
        values: number;
        categories: string;
        count: string | number;
        countPercent: number;
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

export const selectOpenVariableDataAsSummaryStat = createSelector(
  selectOpenVariableData,
  (variable) => {
    const sumStats: {
      Mean?: string;
      Mode?: string;
      Median?: string | number;
      'Total Valid Count'?: string;
      'Total Invalid Count'?: string;
      Minimum?: string;
      Maximum?: string;
      'Standard Deviation'?: string;
    } = {};
    if (variable?.sumStat) {
      variable.sumStat.map((value) => {
        switch (value['@_type']) {
          case 'mean':
            sumStats.Mean = value['#text'] as string;
            break;
          case 'mode':
            sumStats.Mode = value['#text'] as string;
            break;
          case 'medn':
            sumStats.Median = value['#text'] as string;
            break;
          case 'invd':
            sumStats['Total Invalid Count'] = value['#text'] as string;
            break;
          case 'min':
            sumStats.Minimum = value['#text'] as string;
            break;
          case 'stdev':
            sumStats['Standard Deviation'] = value['#text'] as string;
            break;
          case 'max':
            sumStats.Maximum = value['#text'] as string;
            break;
          case 'vald':
            sumStats['Total Valid Count'] = value['#text'] as string;
            break;
        }
      });
      console.log(sumStats);
      return sumStats;
    }
    return sumStats;
  }
);

export const selectChartData = createSelector(
  selectOpenVariableDataAsForm,
  selectOpenVariableDataAsChart,
  selectOpenVariableDataAsSummaryStat,
  (form, chart, sumStat) => {
    return { form, chart, sumStat };
  }
);
