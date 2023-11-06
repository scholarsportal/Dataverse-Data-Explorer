import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './reducers';

export const selectFeature = createFeatureSelector<fromReducer.State>('globalState'); // Replace with your feature name

export const selectData = createSelector(selectFeature, (state) => state.dataset.data);

export const selectVariables = createSelector(selectFeature, (state) => state.dataset.variables);

export const selectGroups = createSelector(selectFeature, (state) => state.dataset.groups);

export const checkOpenGroup = createSelector(selectFeature, (state) => state.openGroup);

export const selectGroupVariables = createSelector(selectVariables, selectGroups, checkOpenGroup, (variables, groups, openGroup) => {
    // const foundVariables = ids.map((id: any) => variables[id]).filter(Boolean);
    if (groups && variables) {
        if (!openGroup) {
            return Object.values(variables)
        }
        else {
            const groupVars = groups[openGroup]['variable']
            const computedVars = groupVars.map((item: any) => variables[item])
            return computedVars
        }
    }
})

export const getDataFetchStatus = createSelector(selectFeature, (state) => state.dataset.status);

export const selectDatasetTitle = createSelector(selectFeature, (state) => {
    return state.dataset.data?.codeBook?.stdyDscr?.citation?.titlStmt?.titl
});

export const selectDatasetVars = createSelector(selectFeature, (state) => {
    return state.dataset.data?.codeBook?.dataDscr?.var
});

export const checkEditing = createSelector(selectFeature, (state) => {
    return state.openVariable.editing
})

export const getVariable = createSelector(selectFeature, (state) => {
    return state.openVariable.variable
})

export const getOpenVariableGraphValues = createSelector(selectFeature, (state) => {
    return state.openVariable.graph
})

export const getVariablePreviouslyOpen = (id: string) => createSelector(selectFeature, (state) => {
    return state.openVariable.previouslyOpen[id]
})
