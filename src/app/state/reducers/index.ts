import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { datasetReducer, DatasetState } from './dataset/dataset.reducer';
import {
  varAndGroupsReducer,
  VarAndGroupsState,
} from './var-and-groups.reducer';
import {
  openVariableReducer,
  OpenVariableState,
} from './open-variable.reducer';
import {
  CrossTabulationState,
  crossTabulationReducer,
} from './cross-tabulation.reducer';

export interface State {
  data: DatasetState;
  'open-variable': OpenVariableState;
  'var-and-groups': VarAndGroupsState;
  'cross-tabulation': CrossTabulationState;
}

export const reducers: ActionReducerMap<State> = {
  data: datasetReducer,
  'open-variable': openVariableReducer,
  'var-and-groups': varAndGroupsReducer,
  'cross-tabulation': crossTabulationReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
