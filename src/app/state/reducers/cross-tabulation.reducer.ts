import { createReducer, on } from '@ngrx/store';
import * as CrossTabActions from '../actions/cross-tabulation.actions';

export interface CrossTabulationState {
  rows: {
    [variableID: number]: {
      missingCategories: string[];
    };
  };
  columns: {
    [variableID: number]: {
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
  on(CrossTabActions.addVariableColumn, (state, { variableID }) => ({
    ...state,
    columns: { ...state.columns, [variableID]: { missingCategories: [] } },
  })),
  on(CrossTabActions.addVariableRow, (state, { variableID }) => ({
    ...state,
    rows: { ...state.rows, [variableID]: { missingCategories: [] } },
  })),
  on(CrossTabActions.removeVariableColumn, (state, { variableID }) => {
    const updatedColumns = { ...state.columns };
    delete updatedColumns[variableID as any];
    return {
      ...state,
      columns: updatedColumns,
    };
  }),
  on(CrossTabActions.removeVariableRow, (state, { variableID }) => {
    const updatedRows = { ...state.rows };
    delete updatedRows[variableID as any];
    return {
      ...state,
      rows: updatedRows,
    };
  })
);
