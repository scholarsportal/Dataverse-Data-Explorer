import { createReducer, on } from '@ngrx/store';
import * as CrossTabActions from '../actions/cross-tabulation.actions';

export interface CrossTabulationState {
  rows: {
    [index: number]: {
      variableID: string;
      missingCategories: string[];
    };
  };
  columns: {
    [index: number]: {
      variableID: string;
      missingCategories: string[];
    };
  };
}

export const initialState: CrossTabulationState = {
  rows: {},
  columns: {},
};

export const crossTabulationReducer = createReducer(
  initialState,
  on(
    CrossTabActions.addVariable,
    (state, { index, variableID, variableType }) => ({
      ...state,
      [variableType]: {
        ...state[variableType],
        [index]: { variableID, missingCategories: [] },
      },
    })
  ),
  on(CrossTabActions.removeVariable, (state, { index, variableType }) => {
    const updatedVariables = { ...state[variableType] };
    delete updatedVariables[index as any];
    return {
      ...state,
      [variableType]: updatedVariables,
    };
  }),
  on(
    CrossTabActions.changeMissingVariables,
    (state, { index, missingVariables, variableType }) => ({
      ...state,
      [variableType]: {
        ...state[variableType],
        [index]: {
          ...state[variableType][index as any],
          missingVariables,
        },
      },
    })
  )
);
