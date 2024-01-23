import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VarAndGroupsState } from '../reducers/var-and-groups.reducer';
import { selectDatasetFeature } from './dataset.selectors';

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
    if (currentGroup) {
      return (
        datasetState.dataset?.codeBook.dataDscr.var.filter((value) =>
          currentGroupIDs?.includes(value['@_ID'])
        ) || []
      );
    }
    return datasetState.dataset?.codeBook.dataDscr.var || [];
  }
);

export const selectCurrentVariableSelected = createSelector(
  selectCurrentGroup,
  selectVarAndGroupsFeature,
  selectDatasetFeature,
  (currentGroup, varGroupsState, dataset) => {
    if (currentGroup) {
      return (
        dataset.dataset?.codeBook.dataDscr.var.filter((value) =>
          varGroupsState.variablesSelected[currentGroup]?.includes(
            value['@_ID']
          )
        ) || []
      );
    }
    return (
      dataset.dataset?.codeBook.dataDscr.var.filter((value) =>
        varGroupsState.variablesSelected['all-variables'].includes(
          value['@_ID']
        )
      ) || []
    );
  }
);
