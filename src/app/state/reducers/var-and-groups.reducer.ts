import { createReducer, on } from '@ngrx/store';
import * as VarAndGroupActions from '../actions/var-and-groups.actions';
import { JSONStructure } from '../interface';

export interface VarAndGroupsState {
  variablesSelected: {
    'all-variables': string[];
    [groupName: string]: string[];
  };
  selectedGroup: string | null;
}

export const initialState: VarAndGroupsState = {
  variablesSelected: {
    'all-variables': [],
  },
  selectedGroup: null,
};

export const varAndGroupsReducer = createReducer(
  initialState,
  on(
    VarAndGroupActions.changeSelectedGroup,
    (state, { groupID }): VarAndGroupsState => ({
      ...state,
      selectedGroup: groupID,
    })
  ),
  on(
    VarAndGroupActions.onSelectVariable,
    (state, { variableIDs }): VarAndGroupsState => {
      const newState: VarAndGroupsState = {
        ...state,
        variablesSelected: { ...state.variablesSelected }, // Create a shallow copy
      };

      if (state.selectedGroup) {
        newState.variablesSelected[state.selectedGroup] = variableIDs;
      } else {
        newState.variablesSelected['all-variables'] = variableIDs;
      }

      return newState;
    }
  )
);
