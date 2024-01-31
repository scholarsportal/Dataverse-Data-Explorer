import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './interface';

export const selectFeature =
  createFeatureSelector<State>('globalState'); // Replace with your feature name

export const selectDataset = createSelector(
  selectFeature,
  (state) => {
    const fileid = Object.values(state.dataset.variables)[0]['location']['@_fileid'] as string
    return { ...state.dataset,  fileid: fileid.substring(1) } }
);

export const selectVariables = createSelector(
  selectFeature,
  (state) => state.dataset.variables
);

export const selectGroups = createSelector(
  selectFeature,
  (state) => state.dataset.groups
);

export const selectVariableGroups = createSelector(
  selectFeature,
  (state) => state.dataset.variableGroups
);

export const selectCheckVariableGroups = (id: string) => createSelector(
  selectFeature,
  (state) =>
    {
      return Object.keys(state.dataset.variableGroups[id]?.groups).length === 0
    }
);

export const selectVariableWeights = createSelector(selectVariables, selectFeature, (variables, state) => {
  const variableWeights: any = []
  Object.keys(state.dataset.weightedVariables).map((varID: string) => variableWeights.push(variables[varID]))
  return Object.values( variableWeights ) ? Object.values( variableWeights ) : []
})

export const checkOpenGroup = createSelector(
  selectFeature,
  (state) => state.changeGroup
);

export const selectGroupVariables = createSelector(
  selectVariables,
  selectGroups,
  checkOpenGroup,
  (variables, groups, openGroup) => {
    // const foundVariables = ids.map((id: any) => variables[id]).filter(Boolean);
    if (groups && variables) {
      if (!openGroup) {
        return Object.values(variables);
      } else {
      const groupVars = groups[openGroup]['@_var'] || [];
      const computedVars = [ ...groupVars ].map((item: any) => variables[item]);
      return computedVars.length ? computedVars : [];
    }
  }
  return [];
}
);

export const getDataFetchStatus = createSelector(
selectFeature,
(state) => state.dataset.status
);

export const selectDatasetTitle = createSelector(selectFeature, (state) => {
return state.dataset.citation?.titlStmt?.titl;
});

export const selectDatasetCitation = createSelector(selectFeature, (state) => {
return state.dataset.citation?.biblCit;
});

export const selectRecentlyChangedGroup = createSelector(selectFeature, (state) => {
  return state.recentlyChanged;
});


export const selectNotifications = createSelector(selectFeature, (state) => {
  return state.notificationStack
})
