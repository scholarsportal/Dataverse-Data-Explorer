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
  columns: {}
};

export const crossTabulationReducer = createReducer(
  initialState,
  on(DatasetActions.datasetConversionSuccess, (state) => ({
    ...state
  })),
  on(CrossTabActions.openCrossTabulationTab, (state) => ({
    ...state,
    open: true
  })),
  on(CrossTabActions.closeCrossTabulationTab, (state) => ({
    ...state,
    open: false
  })),
  on(
    CrossTabActions.addVariableToCrossTabulation,
    (state, { variableID, variableType }) => {
      const newVariableIndex = Object.values(state[variableType]).length;
      return {
        ...state,
        [variableType]: {
          ...state[variableType],
          [newVariableIndex]: { variableID, missingCategories: [] }
        }
      };
    }
  ),
  on(
    CrossTabActions.removeVariableFromCrossTabulation,
    (state, { index, variableType }) => {
      const updatedVariables = { ...state[variableType] };
      delete updatedVariables[index as any];
      return {
        ...state,
        [variableType]: updatedVariables
      };
    }
  ),
  on(
    CrossTabActions.changeMissingVariables,
    (state, { index, missing, variableType }) => ({
      ...state,
      [variableType]: {
        ...state[variableType],
        [index]: {
          ...state[variableType][index as any],
          missingCategories: missing
        }
      }
    })
  ),
  on(
    CrossTabActions.changeVariableInGivenPosition,
    (state, { index, variableType, variableID }) => {
      return {
        ...state,
        [variableType]: {
          ...state[variableType],
          [index]: { variableID, missingCategories: [] }
        }
      };
    }
  )
);
