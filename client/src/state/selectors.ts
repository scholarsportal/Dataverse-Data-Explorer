import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './reducers';

export const selectFeature = createFeatureSelector<fromReducer.State>('dataset'); // Replace with your feature name

export const selectData = createSelector(selectFeature, (state) => state.dataset.data);

export const getDataFetchStatus = createSelector(selectFeature, (state) => state.dataset.status);

export const selectDatasetTitle = createSelector(selectFeature, (state) => {
    return state.dataset.data?.codeBook?.stdyDscr?.citation?.titlStmt?.titl
});

export const selectDatasetVars = createSelector(selectFeature, (state) => {
    return state.dataset.data?.codeBook?.dataDscr?.var
});
