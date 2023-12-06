import { createReducer, on } from '@ngrx/store';
import * as Actions from './actions';
import * as ModalActions from './actions/modal.actions';
import * as GroupActions from './actions/group.actions';
import * as DatasetActions from './actions/dataset.actions';
import { State } from './interface';

const initialState: State = {
  dataset: {
    status: '',
    error: null,
    citation: {
      titlStmt: {
        titl: "",
        IDNo: "",
      },
      rspStmt: {
        AuthEnty: "",
      },
      biblCit: "",
    },
    variables: {},
    variableGroups: {},
    groups: {},
    varWeights: {},
  },
  changeGroup: '',
  recentlyChanged: '',
  modal: {
    open: false,
    id: null,
    mode: '',
    variable: null,
    groups: null,
    state: 'saved'
  },
  notificationStack: {},
  upload: {
    status: '',
    error: null,
  },
};

export const reducer = createReducer(
  initialState,

  // Dataset actions
  on(Actions.fetchDataset, (state) => ({
    ...state,
    dataset: { ...state.dataset, status: 'init' },
  })),
  on(Actions.datasetLoadPending, (state) => ({
    ...state,
    dataset: { ...state.dataset, status: 'pending' },
  })),
  on(Actions.datasetLoadSuccess, (state, { variables, groups, citation, varWeights }) => ({
    ...state,
    dataset: { ...state.dataset, status: 'success', variables, groups, citation, varWeights, error: null },
  })),
  on(Actions.datasetLoadError, (state, { error }) => ({
    ...state,
    dataset: { ...state.dataset, status: 'error', data: null, error },
  })),
  // When the variable groups are calculated
  on(DatasetActions.datasetVariableGroupsLoaded, (state, { variableGroups }) => ({
    ...state,
    dataset: {
      ...state.dataset,
      variableGroups
    }
  })),

  // When the user clicks the chart button
  on(Actions.variableViewChart, (state, { id }) => ({
    ...state,
    modal: { groups: state.dataset.variableGroups[id].groups, id, open: true, mode: 'View', variable: state.dataset.variables[id], state: 'saved' as const },
  })),

  // When the user clicks the edit button
  on(Actions.variableViewDetail, (state, { id }) => ({
    ...state,
    modal: { groups: state.dataset.variableGroups[id].groups, id, open: true, mode: 'Edit', variable: state.dataset.variables[id], state: 'saved' as const },
  })),
  on(ModalActions.variableChangeDetail, (state, {id, variable }) => ({

    ...state,
    modal: {
    ...state.modal,
      changes: 'saved' as const
    },
    dataset: {
      ...state.dataset,
      variables: {
        ...state.dataset.variables,
        [id]: variable
      }
    }

  })),
  on(ModalActions.openModalChangesMade, (state) => ({
    ...state,
    modal: {
      ...state.modal,
      state: 'changes' as const
    }
  })),

  // Change variables and/or variable modes
  on(ModalActions.openVariableChangeMode, (state, { mode }) => ({
    ...state,
    modal: { ...state.modal, mode: mode }
  })),
  on(ModalActions.openVariableSwitchToPrev, (state) => {
    let newIndex = Object.keys(state.dataset.variables).length - 1;
    const currentVariable = state.modal.variable
    const currentVariableIndex = Object.values(state.dataset.variables).indexOf(currentVariable)

    if(currentVariableIndex > 1){
      newIndex = currentVariableIndex - 1
    }

    return {
      ...state,
      modal: {
        ...state.modal,
        groups: Object.values( state.dataset.variableGroups )[newIndex].groups,
        variable: Object.values(state.dataset.variables)[newIndex],
        state: 'saved' as const,
      }
    }
  }),
  on(ModalActions.openVariableSwitchToNext, (state) => {
    let newIndex = 0;
    const currentVariable = state.modal.variable
    const currentVariableIndex = Object.values(state.dataset.variables).indexOf(currentVariable)

    if(currentVariableIndex < ( Object.values(state.dataset.variables).length - 1 )){
      newIndex = currentVariableIndex + 1
    }

    return {
      ...state,
      modal: {
        ...state.modal,
        groups: Object.values( state.dataset.variableGroups )[newIndex].groups,
        variable: Object.values(state.dataset.variables)[newIndex],
        state: 'saved' as const,
      }
    }
  }),

  // When the user clicks a group
  on(GroupActions.groupSelected, (state, { groupID }) => ({
    ...state,
    changeGroup: groupID,
    recentlyChanged: ''
  })),
  on(GroupActions.groupCreateNew, (state, { groupID, label }) => ({
    ...state,
    dataset: {
      ...state.dataset,
      groups: {
        ...state.dataset.groups,
        [groupID]: {
          "@_ID": groupID,
          labl: label,
          "@_var": []
        }
      }
    },
    recentlyChanged: groupID
  })),
  on(GroupActions.variableAddToSelectGroup, (state, { variableIDs, groupID }) => {
    const group = [variableIDs, state.dataset.groups[groupID]['@_var'] || []]
    const merge = [...new Set(group.flat())]
    console.log(merge)
    // console.log(conc)
    const updatedGroups = {
      ...state.dataset.groups,
      [groupID]: {
        ...state.dataset.groups[groupID],
        '@_var': merge
      },
    };

    return {
      ...state,
      recentlyChanged: groupID,
      dataset: {
        ...state.dataset,
        groups: updatedGroups,
      }
    };
  }),
  on(GroupActions.variableRemoveFromSelectGroup, (state, { variableIDs, groupID }) => {
    // select the corresponding group
    const groupToUpdate = state.dataset.groups[groupID];
    // create a new list, by filtering out the ids that are in the input
    const updatedVarList = (groupToUpdate['@_var'] || []).filter((id: string) => !variableIDs.includes(id))

    // create new group state
    const updatedGroups = {
      ...state.dataset.groups,
      [groupID]: {
        ...groupToUpdate,
        '@_var': updatedVarList
      }
    }

    // update the state
    return {
      ...state,
      dataset: {
        ...state.dataset,
        groups: updatedGroups
      }
    }
  }),
  on(GroupActions.groupDetailChanged, (state, { groupID }) => ({
    ...state,
    recentlyChanged: groupID
  })),
  on(GroupActions.groupDelete, (state, { groupID }) => {
    const groupVariables = state.dataset.groups[groupID]
    console.log(groupVariables)

    return {
      ...state
    }
  }),

);

export function appReducer(state: State | undefined, action: any) {
  return reducer(state, action);
}
