import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VarAndGroupsState } from '../reducers/var-and-groups.reducer';
import {
  selectDatasetFeature,
  selectDatasetVariables,
} from './dataset.selectors';
import { Variable } from '../interface';

export const selectVarAndGroupsFeature =
  createFeatureSelector<VarAndGroupsState>('var-and-groups');

export const selectCurrentGroup = createSelector(
  selectVarAndGroupsFeature,
  (state) => state.selectedGroup
);

export const selectCurrentGroupIDs = createSelector(
  selectCurrentGroup,
  selectDatasetFeature,
  (currentGroup, datasetState) => {
    // find the group id that matches the current selected group
    return (
      datasetState.dataset?.codeBook.dataDscr.varGrp
        .find((group) => group['@_ID'] === currentGroup)
        ?.['@_var'].split(' ') || []
    ); // if the group is found, return a comma separated list
  }
);

export const selectCurrentVarList = createSelector(
  selectDatasetFeature,
  selectCurrentGroup,
  selectCurrentGroupIDs,
  (datasetState, currentGroup, currentGroupIDs) => {
    const varList = Object.values(
      datasetState.dataset?.codeBook.dataDscr.var || {}
    ) as Variable[];
    if (currentGroup) {
      return (
        varList.filter((value) => currentGroupIDs?.includes(value['@_ID'])) ||
        []
      );
    }
    return datasetState.dataset?.codeBook.dataDscr.var || [];
  }
);

export const selectCurrentVariableSelected = createSelector(
  selectCurrentGroup,
  selectVarAndGroupsFeature,
  selectDatasetFeature,
  (currentGroup, varGroupsState, datasetState) => {
    const varList = Object.values(
      datasetState.dataset?.codeBook.dataDscr.var || {}
    ) as Variable[];
    if (currentGroup) {
      return (
        varList.filter((value) =>
          varGroupsState.variablesSelected[currentGroup]?.includes(
            value['@_ID']
          )
        ) || []
      );
    }
    return (
      varList.filter((value) =>
        varGroupsState.variablesSelected['all-variables'].includes(
          value['@_ID']
        )
      ) || []
    );
  }
);

export const selectVariableWeights = createSelector(
  selectDatasetFeature,
  selectDatasetVariables,
  (datasetState, datasetVariables) => {
    const varList = Object.values(
      datasetState.dataset?.codeBook.dataDscr.var || {}
    ) as Variable[];
    const weights: { [id: string]: string } = {};

    if (datasetVariables) {
      varList.map((variable: Variable) => {
        console.log(variable['@_wgt-var']);
        const wgtVar = variable['@_wgt-var'] as string;
        weights[wgtVar] = datasetVariables?.[wgtVar].labl['#text'] || '';
      });
    }

    return weights;
  }
);
