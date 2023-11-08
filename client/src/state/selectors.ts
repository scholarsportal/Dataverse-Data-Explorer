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

export const selectGroupTitles = createSelector(selectGroups, (groups) => {
    return Object.values(groups).map((item: any) => item.labl)
})

export const getDataFetchStatus = createSelector(selectFeature, (state) => state.dataset.status);

export const selectDatasetTitle = createSelector(selectFeature, (state) => {
    return state.dataset.data?.codeBook?.stdyDscr?.citation?.titlStmt?.titl
});

export const checkEditing = createSelector(selectFeature, (state) => {
    return state.openVariable.editing
})

export const selectOpenVariable = createSelector(selectFeature, (state) => {
    return state.openVariable.variable
})

export const selectOpenVarDetail = createSelector(selectOpenVariable, selectGroups, (variable, groups) => {
    if (variable && groups) {
        const group: any = Object.values(groups).find((item: any) => item.variable.includes(variable['@_ID'])) || null;
        const groupLabel = group ? group.item.labl : ''
        const literalQuestion = variable.qstn?.qstnLit || '';
        const interviewerQuestion = variable.qstn?.ivuInstr || '';
        const postQuestion = variable.qstn?.postQTxt || '';
        const universe = variable['universe'] || '';
        const notes = Array.isArray(variable['notes']) ? variable['notes'][0] : '';
        return {
            id: variable['@_ID'],
            name: variable['@_name'],
            label: variable['labl']['#text'],
            literalQuestion: literalQuestion,
            interviewerQuestion: interviewerQuestion,
            postQuestion: postQuestion,
            universe: universe,
            notes: notes,
            group: groupLabel,
            isWeight: variable['@_wgt'] ? true : false,
            weightVar: variable['@_wgt-var'] ? variable['@_wgt-var'] : '',
        }
    }
    return undefined
})

export const getOpenVariableGraphValues = createSelector(selectFeature, (state) => {
    return state.openVariable.graph
})

export const getVariablePreviouslyOpen = (id: string) => createSelector(selectFeature, (state) => {
    return state.openVariable.previouslyOpen[id]
})
