import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './reducers';

export const selectFeature = createFeatureSelector<fromReducer.State>('appReducer'); // Replace with your feature name

export const selectDatasetTitle = createSelector(selectFeature, (state) => state.dataset.data?.citations?.title);
