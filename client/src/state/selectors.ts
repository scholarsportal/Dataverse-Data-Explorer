import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './interface';

export const selectFeature =
  createFeatureSelector<State>('globalState'); // Replace with your feature name

export const selectVariables = createSelector(
  selectFeature,
  (state) => state.dataset.variables
);

export const selectGroups = createSelector(
  selectFeature,
  (state) => state.dataset.groups
);

export const selectVariableWeights = createSelector(selectVariables, selectFeature, (variables, state) => {
  const variableWeights: any = []
  Object.keys(state.dataset.varWeights).map((varID: string) => variableWeights.push(variables[varID]))
  return variableWeights
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
      const computedVars = groupVars.map((item: any) => variables[item]);
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


export const selectRecentlyChangedGroup = createSelector(selectFeature, (state) => {
  return state.recentlyChanged;
});


export const selectNotifications = createSelector(selectFeature, (state) => {
  return state.notificationStack
})
