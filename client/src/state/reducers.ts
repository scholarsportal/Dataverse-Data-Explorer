import { createReducer, on } from '@ngrx/store';
import * as Actions from './actions';
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
    groups: {},
    varWeights: {},
  },
  changeGroup: '',
  recentlyChanged: '',
  openModal: {
    open: false,
    id: null,
    modalMode: '',
    variable: null,
    graph: null,
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
  // When the page first loads
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

  // When the user clicks the chart button
  on(Actions.variableViewChart, (state, { id }) => ({
    ...state,
    openModal: {...state.openModal, id, open: true, modalMode: 'View', variable: state.dataset.variables[id], state: 'saved' as const },
  })),

  on(Actions.variableCreateGraphSuccess,
    (state, { weighted, unweighted }) => ({
      ...state,
      openModal: {
        ...state.openModal,
        graph: { weighted, unweighted },
      },
    })
  ),
  on(Actions.variableCreateGraphError, (state) => ({
    ...state,
    openModal: {
      ...state.openModal,
      graph: null,
    },
  })),

  // When the user clicks the edit button
  on(Actions.variableViewDetail, (state, { id }) => ({
    ...state,
    openModal: {...state.openModal, id, open: true, modalMode: 'Edit', variable: state.dataset.variables[id], state: 'saved' as const },
  })),
  on(Actions.openVariableChangeMode, (state, { mode }) => ({
    ...state,
    openModal: { ...state.openModal, modalMode: mode }
  })),
  on(Actions.openVariableSwitchToPrev, (state) => {
    let newIndex = Object.keys(state.dataset.variables).length - 1;
    const currentVariable = state.openModal.variable
    const currentVariableIndex = Object.values(state.dataset.variables).indexOf(currentVariable)

    if(currentVariableIndex > 1){
      newIndex = currentVariableIndex - 1
    }

    return {
      ...state,
      openModal: {
        ...state.openModal,
        variable: Object.values(state.dataset.variables)[newIndex],
        state: 'saved' as const,
      }
    }
  }),
  on(Actions.openVariableSwitchToNext, (state) => {
    let newIndex = 0;
    const currentVariable = state.openModal.variable
    const currentVariableIndex = Object.values(state.dataset.variables).indexOf(currentVariable)

    if(currentVariableIndex < ( Object.values(state.dataset.variables).length - 1 )){
      newIndex = currentVariableIndex + 1
    }

    return {
      ...state,
      openModal: {
        ...state.openModal,
        variable: Object.values(state.dataset.variables)[newIndex],
        state: 'saved' as const,
      }
    }
  }),

  // When the user clicks a group
  on(Actions.groupSelected, (state, { groupID }) => ({
    ...state,
    changeGroup: groupID,
    recentlyChanged: ''
  })),
  on(Actions.groupCreateNew, (state, { groupID, label }) => ({
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
  on(Actions.variableAddToSelectGroup, (state, { variableIDs, groupID }) => {
    const updatedGroups = {
      ...state.dataset.groups,
      [groupID]: {
        ...state.dataset.groups[groupID],
        '@_var': [
          ...(state.dataset.groups[groupID]['@_var'] || []), // Ensure '@_var' is an array
          ...variableIDs,
        ],
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
  on(Actions.variableRemoveFromSelectGroup, (state, { variableIDs, groupID }) => {
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
  on(Actions.groupDetailChanged, (state, { groupID }) => ({
    ...state,
    recentlyChanged: groupID
  })),

  // Notifications
  on(Actions.pushNotification, (state, { notificationType, message }) => {
    let updatedStack = { notificationType, message };

    // Max of 5 notifications at a time
    // if(updatedStack.length === MAX_NOTIFICATIONS) { updatedStack = updatedStack.slice(1) }

    return { ...state, notificationStack: updatedStack }
  }),

  // on(Actions.removeNotification, (state, {index}) => {
  //   return { ...state, notificationStack: state.notificationStack.splice(index, 1)}
  // }),
  // on(Actions.datasetUploadRequest, (state) => ({ ...state, upload: { status: 'pending', error: null } })),
  // on(Actions.datasetUploadPending, (state) => ({ ...state, upload: { status: 'pending', error: null } })),
  // on(Actions.datasetUploadSuccess, (state) => ({ ...state, upload: { status: 'success', error: null } })),
  // on(Actions.datasetUploadError, (state, { error }) => ({ ...state, upload: { status: 'error', error } })),
  // on(Actions.datasetDownload, (state) => state), // No state change needed for download
  // on(Actions.datasetLocalSave, (state) => state), // No state change needed for local save
  // on(Actions.variableChangeDetail, (state, { variable }) => ({ ...state, variables: [...state.variables], upload: { status: '', error: null } })),
  // on(Actions.variableAddToSelectedGroup, (state, { variable }) => ({ ...state, variables: [...state.variables], upload: { status: '', error: null } })),
  //   on(Actions.groupCreateNew, (state) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } }))),
  // on(Actions.groupRemove, (state, { groupId }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } })),
  // on(Actions.groupChangeName, (state, { groupId, newName }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } })),
  // on(Actions.groupAddSelectedGroup, (state, { groupId }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } }),
);

export function appReducer(state: State | undefined, action: any) {
  return reducer(state, action);
}
