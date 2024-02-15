import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { datasetReducer, DatasetState } from './dataset.reducer';
import {
  varAndGroupsReducer,
  VarAndGroupsState,
} from './var-and-groups.reducer';
import {
  openVariableReducer,
  OpenVariableState,
} from './open-variable.reducer';

export interface State {
  data: DatasetState;
  'open-variable': OpenVariableState;
  'var-and-groups': VarAndGroupsState;
}

export const reducers: ActionReducerMap<State> = {
  data: datasetReducer,
  'open-variable': openVariableReducer,
  'var-and-groups': varAndGroupsReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
