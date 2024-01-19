import { createReducer, on } from '@ngrx/store';
import * as VarAndGroupActions from '../actions/var-and-groups.actions';
import { JSONStructure } from '../interface';

export interface VarAndGroupsState {
  variablesSelected: string | null[];
  selectedGroup: string;
  variablesSelectedWithinGroup: string | null[];
}

export const initialState: VarAndGroupsState = {
  variablesSelected: [],
  selectedGroup: '',
  variablesSelectedWithinGroup: [],
};

export const varAndGroupsReducer = createReducer(
  initialState,
  on(
    VarAndGroupActions.changeSelectedGroup,
    (state, { groupID }): VarAndGroupsState => ({
      ...state,
      selectedGroup: groupID,
    })
  )
);
