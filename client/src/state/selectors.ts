import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './reducers';

export const selectFeature =
  createFeatureSelector<fromReducer.State>('globalState'); // Replace with your feature name

export const selectVariables = createSelector(
  selectFeature,
  (state) => state.dataset.variables
);

export const selectGroups = createSelector(
  selectFeature,
  (state) => state.dataset.groups
);

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
        const groupVars = groups[openGroup]['@_var'];
        const computedVars = groupVars.map((item: any) => variables[item]);
        return computedVars;
      }
    }
    return [];
  }
);

export const selectGroupTitles = createSelector(selectGroups, (groups) => {
  return Object.values(groups).map((item: any) => item.labl);
});

export const getDataFetchStatus = createSelector(
  selectFeature,
  (state) => state.dataset.status
);

export const selectDatasetTitle = createSelector(selectFeature, (state) => {
  return state.dataset.citation?.titlStmt?.titl;
});

export const checkEditing = createSelector(selectFeature, (state) => {
  return state.openVariable.editing;
});

export const selectOpenVariable = createSelector(selectFeature, (state) => {
  return state.openVariable.variable;
});

export const selectOpenVarDetail = createSelector(
  selectOpenVariable,
  selectGroups,
  (variable, groups) => {
    if (variable && groups) {
      return { variable, groups }
    }
    return { variable: {}, groups: {} };
  }
);

export const getOpenVariableGraphValues = createSelector(
  selectFeature,
  (state) => {
    return state.openVariable.graph;
  }
);

export const getVariablePreviouslyOpen = (id: string) =>
  createSelector(selectFeature, (state) => {
    return state.openVariable.previouslyOpen[id];
  });
