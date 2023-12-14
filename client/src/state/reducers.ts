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
        titl: '',
        IDNo: '',
      },
      rspStmt: {
        AuthEnty: '',
      },
      biblCit: '',
    },
    variables: {},
    variableGroups: {},
    groups: {},
    weightedVariables: {},
  },
  changeGroup: '',
  recentlyChanged: '',
  modal: {
    open: false,
    id: null,
    mode: '',
    variable: null,
    groups: null,
    state: 'saved',
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
  on(
    Actions.datasetLoadSuccess,
    (state, { variables, groups, citation, weightedVariables }) => ({
      ...state,
      dataset: {
        ...state.dataset,
        status: 'success',
        variables,
        groups,
        citation,
        weightedVariables,
        error: null,
      },
    })
  ),
  on(Actions.datasetLoadError, (state, { error }) => ({
    ...state,
    dataset: { ...state.dataset, status: 'error', data: null, error },
  })),
  // When the variable groups are calculated
  on(
    DatasetActions.datasetVariableGroupsLoaded,
    (state, { variableGroups }) => ({
      ...state,
      dataset: {
        ...state.dataset,
        variableGroups,
      },
    })
  ),

  // When the user clicks the chart button
  on(Actions.variableViewChart, (state, { id }) => ({
    ...state,
    modal: {
      groups: state.dataset.variableGroups[id].groups,
      id,
      open: true,
      mode: 'View',
      variable: state.dataset.variables[id],
      state: 'saved' as const,
    },
  })),

  // When the user clicks the edit button
  on(Actions.variableViewDetail, (state, { id }) => ({
    ...state,
    modal: {
      groups: state.dataset.variableGroups[id].groups,
      id,
      open: true,
      mode: 'Edit',
      variable: state.dataset.variables[id],
      state: 'saved' as const,
    },
  })),
  on(Actions.startVariableBulkEdit, (state, { variableIDs }) => ({
    ...state,
    modal: {
      open: true,
      id: variableIDs,
      mode: 'Bulk Edit',
      variable: null,
      groups: null,
      state: 'saved' as const,
    },
  })),
  on(Actions.saveVariableBulkEdit, (state, { variableIDs, template }) => {
    console.log(variableIDs);
    console.log(template);

    return {
      ...state,
    };
  }),
  on(Actions.variableBulkAssignWeight, (state, { variableIDs, weight }) => {
    const updatedVariables = { ...state.dataset.variables };

    variableIDs.forEach((id: string) => {
      if (updatedVariables[id] && updatedVariables[id]['@_wgt'] !== 'wgt') {
        updatedVariables[id] = {
          ...updatedVariables[id],
          '@_wgt-var': weight['@_ID'],
        };
      }
    });

    return {
      ...state,
      dataset: {
        ...state.dataset,
        variables: updatedVariables,
      },
    };
  }),
  on(ModalActions.variableSave, (state, { id, variable, groups }) => {
    // TODO: Change weighted variables
    // Loop through each group
    Object.keys(state.dataset.groups).forEach((item: any) => {
      if (Object.keys(groups).includes(state.dataset.groups[item]['@_ID'])) {
        state.dataset.groups[item]['@_var'].add(id);
      } else {
        state.dataset.groups[item]['@_var'].delete(id);
      }
    });

    return {
      ...state,
      modal: {
        ...state.modal,
        variable: {
          ...state.modal.variable,
          ...variable,
        },
        changes: 'saved' as const,
      },
      dataset: {
        ...state.dataset,
        variables: {
          ...state.dataset.variables,
          [id]: {
            ...state.dataset.variables[id],
            ...variable,
          },
        },
        variableGroups: {
          ...state.dataset.variableGroups,
          [id]: {
            groups: groups,
          },
        },
      },
    };
  }),
  on(ModalActions.openModalChangesMade, (state) => ({
    ...state,
    modal: {
      ...state.modal,
      state: 'changes' as const,
    },
  })),

  // Change variables and/or variable modes
  on(ModalActions.openVariableChangeMode, (state, { mode }) => ({
    ...state,
    modal: { ...state.modal, mode: mode },
  })),
  on(ModalActions.openVariableSwitchToPrev, (state) => {
    let newIndex = Object.keys(state.dataset.variables).length - 1;
    const currentVariable = state.modal.variable;
    const currentVariableIndex = Object.values(state.dataset.variables).indexOf(
      currentVariable
    );

    if (currentVariableIndex > 1) {
      newIndex = currentVariableIndex - 1;
    }

    return {
      ...state,
      modal: {
        ...state.modal,
        groups: Object.values(state.dataset.variableGroups)[newIndex].groups,
        variable: Object.values(state.dataset.variables)[newIndex],
        state: 'saved' as const,
      },
    };
  }),
  on(ModalActions.openVariableSwitchToNext, (state) => {
    let newIndex = 0;
    const currentVariable = state.modal.variable;
    const currentVariableIndex = Object.values(state.dataset.variables).indexOf(
      currentVariable
    );

    if (
      currentVariableIndex <
      Object.values(state.dataset.variables).length - 1
    ) {
      newIndex = currentVariableIndex + 1;
    }

    return {
      ...state,
      modal: {
        ...state.modal,
        groups: Object.values(state.dataset.variableGroups)[newIndex].groups,
        variable: Object.values(state.dataset.variables)[newIndex],
        state: 'saved' as const,
      },
    };
  }),

  // When the user clicks a group
  on(GroupActions.groupSelected, (state, { groupID }) => ({
    ...state,
    changeGroup: groupID,
    recentlyChanged: '',
  })),
  on(GroupActions.groupCreateNew, (state, { groupID, label }) => ({
    ...state,
    dataset: {
      ...state.dataset,
      groups: {
        ...state.dataset.groups,
        [groupID]: {
          '@_ID': groupID,
          labl: label,
          '@_var': new Set<string>(),
        },
      },
    },
    recentlyChanged: groupID,
  })),
  on(
    GroupActions.variableAddToSelectGroup,
    (state, { variableIDs, groupID }) => {
      const existingVarSet =
        state.dataset.groups[groupID]['@_var'] || new Set<string>();

      const updatedVarSet = new Set<string>([
        ...existingVarSet,
        ...variableIDs,
      ]);

      const updatedGroups = {
        ...state.dataset.groups,
        [groupID]: {
          ...state.dataset.groups[groupID],
          '@_var': updatedVarSet,
        },
      };

      return {
        ...state,
        recentlyChanged: groupID,
        dataset: {
          ...state.dataset,
          groups: updatedGroups,
        },
      };
    }
  ),
  on(
    GroupActions.variableRemoveFromSelectGroup,
    (state, { variableIDs, groupID }) => {
      // select the corresponding group
      const groupToUpdate = state.dataset.groups[groupID];
      // create a new list, by filtering out the ids that are in the input
      const updatedVarList = Array.from(groupToUpdate['@_var'] || []).filter(
        (id: string) => !variableIDs.includes(id)
      );
      const updatedVarSet = new Set<string>(updatedVarList);

      // create new group state
      const updatedGroups = {
        ...state.dataset.groups,
        [groupID]: {
          ...groupToUpdate,
          '@_var': updatedVarSet,
        },
      };

      // update the state
      return {
        ...state,
        dataset: {
          ...state.dataset,
          groups: updatedGroups,
        },
      };
    }
  ),
  on(GroupActions.groupDetailChanged, (state, { groupID }) => ({
    ...state,
    recentlyChanged: groupID,
  })),
  on(GroupActions.groupDelete, (state, { groupID }) => {
    const updatedVariableGroups = JSON.parse(
      JSON.stringify({ ...state.dataset.variableGroups })
    );
    const variableList =
      state.dataset.groups[groupID]?.['@_var'] || new Set<string>();

    variableList.forEach((item: string) => {
      const groupInfo = updatedVariableGroups[item]?.groups;
      if (groupInfo && groupInfo[groupID]) {
        delete groupInfo[groupID];
        updatedVariableGroups[item] = {
          ...updatedVariableGroups[item],
          groups: { ...groupInfo },
        };
      }
    });

    const updatedGroups = { ...state.dataset.groups };
    delete updatedGroups[groupID];

    return {
      ...state,
      dataset: {
        ...state.dataset,
        groups: updatedGroups,
        variableGroups: updatedVariableGroups,
      },
    };
  }),
  on(GroupActions.groupChangeName, (state, { groupID, newName }) => {
    const updatedVariableGroups = JSON.parse(
      JSON.stringify({ ...state.dataset.variableGroups })
    );
    const variableList = state.dataset.groups[groupID]['@_var']
      ? state.dataset.groups[groupID]['@_var']
      : new Set<string>();

    console.log(state.dataset.groups[groupID]);
    console.log(groupID);
    console.log(newName);
    console.log(variableList);

    variableList.forEach((item: string) => {
      const group = updatedVariableGroups[item]?.groups;
      if (group && group[groupID]) {
        group[groupID] = newName;
        updatedVariableGroups[item] = {
          ...updatedVariableGroups[item],
          groups: { ...group },
        };
      }
    });

    const updatedGroups = { ...state.dataset.groups };
    updatedGroups[groupID] = { ...updatedGroups[groupID], labl: newName };

    return {
      ...state,
      dataset: {
        ...state.dataset,
        groups: updatedGroups,
        variableGroups: updatedVariableGroups,
      },
    };
  })
);

export function appReducer(state: State | undefined, action: any) {
  return reducer(state, action);
}
