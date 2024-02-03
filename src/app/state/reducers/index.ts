import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { datasetReducer, DatasetState } from './dataset.reducer';
import {
  varAndGroupsReducer,
  VarAndGroupsState,
} from './var-and-groups.reducer';
import { uiReducer, UIState } from './ui.reducer';

export interface State {
  data: DatasetState;
  ui: UIState;
  'var-and-groups': VarAndGroupsState;
}

export const reducers: ActionReducerMap<State> = {
  data: datasetReducer,
  ui: uiReducer,
  'var-and-groups': varAndGroupsReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
