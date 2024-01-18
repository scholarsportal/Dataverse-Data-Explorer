import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { datasetReducer, DatasetState } from './dataset.reducer';

export interface State {
  data: DatasetState;
}

export const reducers: ActionReducerMap<State> = {
  data: datasetReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
