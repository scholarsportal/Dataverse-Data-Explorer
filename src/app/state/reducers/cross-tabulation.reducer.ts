import { createReducer, on } from '@ngrx/store';
import * as CrossTabActions from '../actions/cross-tabulation.actions';
import * as DatasetActions from '../actions/dataset.actions';

export interface CrossTabulationState {
  open: boolean;
  rows: {
    [index: number]: {
      crossValues: string[] | null;
      variableID: string | null;
      missingCategories: string[];
    };
  };
  columns: {
    [index: number]: {
      crossValues: string[] | null;
      variableID: string | null;
      missingCategories: string[];
    };
  };
  error?: any;
}

export const initialState: CrossTabulationState = {
  open: true,
  rows: {
    0: {
      crossValues: null,
      variableID: null,
      missingCategories: [],
    },
    1: {
      crossValues: null,
      variableID: null,
      missingCategories: [],
    },
  },
  columns: {
    0: {
      crossValues: null,
      variableID: null,
      missingCategories: [],
    },
    1: {
      crossValues: null,
      variableID: null,
      missingCategories: [],
    },
  },
};

export const crossTabulationReducer = createReducer(
  initialState,
  on(DatasetActions.datasetConversionSuccess, (state, { dataset }) => ({
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
    (state, { index, variableID, crossTableOrientation }) => ({
      ...state,
      [crossTableOrientation]: {
        ...state[crossTableOrientation],
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
  on(
    CrossTabActions.variableCrossTabulationDataRetrievalFailed,
    (state, { error }) => {
      return {
        ...state,
        error,
      };
    },
  ),
);
