import { createFeatureSelector, createSelector } from "@ngrx/store";
import { State } from "../interface";
import { selectGroups, selectVariableWeights, selectVariables } from "../selectors";

const selectFeature = createFeatureSelector<State>('globalState');

export const selectOpenModal = createSelector(selectFeature, (state) => state.openModal)

export const selectOpenVariable = createSelector(selectFeature, (state) => {
    return state.openModal?.variable;
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

export const selectOpenModalDetail = createSelector(
    selectOpenVariable,
    selectGroups,
    selectVariableWeights,
    selectVariables,
    (openVariable, groups, varWeights, variables) => {
        let data: any = {};
        let total: number = 0;
        let sumStats: any = []
        if (openVariable && groups && varWeights) {
            sumStats = openVariable['sumStat']

            if (openVariable['catgry']) {
                openVariable['catgry'].forEach((item: any) => {
                    total += item.catStat[0]['#text'] ? item.catStat[0]['#text'] : 0
                    data = {
                        ...data,
                        [item.catValu]: {
                            category: item.labl['#text'],
                            count: item.catStat[0]['#text'],
                            weightedCount: item.catStat[1]['#text'],
                        }
                    }
                });
            }

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
            return { variable, groups, varWeights, data, total, sumStats }
        }
        return { variable: {}, groups: {}, data, sumStats };
    }
);
