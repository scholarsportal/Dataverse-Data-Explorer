import { createReducer, on } from '@ngrx/store';
import * as CrossTabActions from '../actions/cross-tabulation.actions';
import * as DatasetActions from '../actions/dataset.actions';

export interface CrossTabulationState {
  open: boolean;
  variablesMetadata: {
    [variableID: string]: {
      missing: string[],
      crossTabValues: string[] | null
    }
  },
  selectedVariables: {
    [index: number]: {
      variableType: 'row' | 'column'
      variableID: string;
    };
  }
}

export const initialState: CrossTabulationState = {
  open: true,
  variablesMetadata: {},
  selectedVariables: {}
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
      const lastIndexInCrossTab = Object.keys(state.selectedVariables).length;
      return {
        ...state,
        selectedVariables: {
          ...state.selectedVariables,
          [lastIndexInCrossTab]: {
            variableID,
            variableType
          }
        }
      };
    }
  ),
  on(
    CrossTabActions.removeVariableFromCrossTabulation,
    (state, { index }) => {
      const stateCopy = structuredClone(state);
      delete stateCopy.selectedVariables[index];
      return {
        ...stateCopy
      };
    }
  ),
  on(
    CrossTabActions.changeMissingVariables,
    (state, { variableID, missing }) => ({
      ...state,
      variablesMetadata: {
        ...state.variablesMetadata,
        [variableID]: {
          ...state.variablesMetadata[variableID],
          missing
        }
      }
    })
  ),
  on(
    CrossTabActions.changeVariableInGivenPosition,
    (state, { index, variableType, variableID }) => {
      return {
        ...state,
        selectedVariables: {
          ...state.selectedVariables,
          [index]: {
            variableID,
            variableType
          }
        }
      };
    }
  ),
  on(CrossTabActions.variableCrossTabulationDataRetrievedSuccessfully, (state, { variableID, data }) => {
    // From: https://stackoverflow.com/a/52947649
    function splitLines(t: string): string[] {
      return t.split(/\r\n|\r|\n/);
    }

    const crossTabValues = splitLines(data);
    return {
      ...state,
      variablesMetadata: {
        ...state.variablesMetadata,
        [variableID]: {
          ...state.variablesMetadata[variableID],
          crossTabValues
        }
      }
    };
  })
);
