import { createReducer, on } from '@ngrx/store';
import * as Actions from './../actions';
import { VarGroups, Variables, Citation } from '../interface';

export interface DatasetState {
    status: string;
    error: string | null;
    citation: Citation;
    variables: Variables;
    groups: VarGroups;
    varWeights: any
}

const initialState: DatasetState = {
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
};

const datasetReducer = createReducer(
    initialState,
  on(Actions.fetchDataset, (state) => ({
    ...state,
    status: 'init'
  })),
  on(Actions.datasetLoadPending, (state) => ({
    ...state,
    status: 'pending'
  })),
  on(Actions.datasetLoadSuccess, ({ variables, groups, citation, varWeights }) => ({
      status: 'success',
      variables,
      varWeights,
      groups,
      citation,
      error: null
  })),
    // TODO: Create an effect that listens to this and changes overallstate error stack
  // Allow us to tell the user they have the wrong file id, siteurl, apikey etc.
  on(Actions.datasetLoadError, (state, { error }) => ({
    ...state,
      status: 'error',
      error,
  })),

);

export function datasetReducerFn(state: DatasetState, action: any) {
   return datasetReducer(state, action)
}
