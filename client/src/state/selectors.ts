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

export const selectOpenVariable = createSelector(selectFeature, (state) => {
return state.openVariable?.variable;
});

export const selectOpenVariableGroups = createSelector(selectOpenVariable, (state) => {
return state.groups;
});

export const selectCheckOpenModal = createSelector(selectFeature, (state) => {
  return state.openModal.open
})

export const selectCheckOpenModalMode = createSelector(selectFeature, (state) => {
  return state.openModal.modalMode
})

export const selectCheckOpenModalState = createSelector(selectFeature, (state) => {
  return state.openModal.state
})

export const selectCheckOpenModalVariable = createSelector(selectFeature, (state) => {
  return state.openModal.variable
})

export const selectCheckOpenModalLabel = createSelector(selectFeature, (state) => {
  return state.openModal.variable?.labl['#text']
})

export const selectCheckOpenModalID = createSelector(selectFeature, (state) => {
  return state.openModal.variable ? state.openModal.variable['@_ID'] : null;
})

export const selectCheckOpenModalName = createSelector(selectFeature, (state) => {
  return state.openModal.variable ? state.openModal.variable['@_name'] : null;
})

export const selectOpenVarDetail = createSelector(
selectOpenVariable,
selectGroups,
selectVariableWeights,
selectVariables,
(openVariable, groups, varWeights, variables) => {
  if (openVariable && groups && varWeights) {
    const variable: any = {
      id: openVariable['@_ID'],
      name: openVariable['@_name'],
      label: openVariable.labl['#text'],
      literalQuestion: openVariable.qstn?.qstnLit,
      interviewerQuestion: openVariable.qstn?.ivuInstr,
      postQuestion: openVariable.qstn?.postQTxt,
      universe: openVariable.universe,
      notes: openVariable.notes[1],
      group: openVariable.groups,
      isWeight: openVariable['@_wgt'] ? true : false,
      weightVar: openVariable['@_wgt-var'] ? variables[openVariable['@_wgt-var']]['@_name'] : '',
    }
    return { variable, groups, varWeights }
  }
  return { variable: {}, groups: {} };
}
);

export const selectVariableDetail = (id: string) => createSelector(selectFeature, (state) => {
return state.dataset.variables[id]
})

export const selectRecentlyChangedGroup = createSelector(selectFeature, (state) => {
  return state.recentlyChanged;
});


export const selectNotifications = createSelector(selectFeature, (state) => {
return state.notificationStack
})
