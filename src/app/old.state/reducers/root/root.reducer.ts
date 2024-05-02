import { createReducer, on } from '@ngrx/store';
import * as DatasetActions from '../../actions/dataset.actions';

export interface RootState {
  theme: 'dark' | 'light' | 'dctTheme';
  applicationMode: 'view' | 'edit';
}

export const initialState: RootState = {
  theme: 'dctTheme',
  applicationMode: 'view'
};

export const rootReducer = createReducer(
  initialState,
  on(DatasetActions.datasetConversionSuccess, (state, { apiKey }) => {
    const newState = { ...state };
    if (apiKey) {
      newState.applicationMode = 'edit';
    }
    return newState;
  })
);
