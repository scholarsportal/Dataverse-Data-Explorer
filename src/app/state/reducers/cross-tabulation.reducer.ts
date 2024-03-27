import { createReducer, on } from '@ngrx/store';
import * as CrossTabActions from '../actions/cross-tabulation.actions';
import * as DatasetActions from '../actions/dataset.actions';

export interface CrossTabulationState {
  open: boolean;
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
  open: true,
  rows: {},
  columns: {},
};

export const crossTabulationReducer = createReducer(
  initialState,
  on(DatasetActions.datasetConversionSuccess, (state) => ({
    ...state,
  })),
  on(CrossTabActions.openCrossTabulationTab, (state) => ({
    ...state,
    open: true,
  })),
  on(CrossTabActions.closeCrossTabulationTab, (state) => ({
    ...state,
    open: false,
  })),
  on(
    CrossTabActions.addVariable,
    (state, { index, variableID, variableType }) => ({
      ...state,
      [variableType]: {
        ...state[variableType],
        [index]: { variableID, missingCategories: [] },
      },
    }),
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
    }),
  ),
);
