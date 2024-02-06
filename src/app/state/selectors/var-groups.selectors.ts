import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VarAndGroupsState } from '../reducers/var-and-groups.reducer';
import {
  selectDatasetFeature,
  selectDatasetVariableGroups,
  selectDatasetVariables,
} from './dataset.selectors';
import { Variable, VariableGroup } from '../interface';
import {
  selectOpenVariableData,
  selectOpenVariableID,
  selectOpenVariableModalMode,
  selectUIFeature,
} from './ui.selectors';

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
  selectDatasetVariables,
  (datasetVariables): { [id: string]: string } => {
    const weights: {
      [id: string]: string;
    } = {};

    if (datasetVariables) {
      Object.values(datasetVariables).map((variable: Variable) => {
        const wgtVar = variable['@_wgt-var'] as string | undefined;
        if (wgtVar) {
          weights[wgtVar] = datasetVariables[wgtVar].labl['#text'];
        }
      });
    }

    return weights;
  }
);

export const selectVariablesWithGroupsReference = createSelector(
  selectDatasetVariableGroups,
  selectDatasetVariables,
  (groups, datasetVariables) => {
    const variablesGroupsReference: {
      [variableID: string]: { groups: VariableGroup[]; label: string };
    } = {};
    if (datasetVariables) {
      groups?.map((variableGroup) => {
        variableGroup['@_var'].split(' ').map((variableID) => {
          variablesGroupsReference[variableID]
            ? variablesGroupsReference[variableID].groups.push(variableGroup)
            : (variablesGroupsReference[variableID] = {
                label: datasetVariables[variableID].labl['#text'],
                groups: [variableGroup],
              });
        });
      });
    }

    return variablesGroupsReference;
  }
);
