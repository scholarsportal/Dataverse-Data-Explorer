import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from '../reducers/ui.reducer';
export const selectUIFeature = createFeatureSelector<UIState>('ui');

export const selectIsOptionsMenuOpen = createSelector(
  selectUIFeature,
  (state) => state.modal.open && state.modal.type === 'options'
);
