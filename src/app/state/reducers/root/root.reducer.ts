import { createReducer, on } from '@ngrx/store';
import * as DatasetActions from '../../actions/dataset.actions';

export interface RootState {
  theme: 'dark' | 'light' | 'system';
  applicationMode: 'view' | 'edit';
}

export const initialState: RootState = {
  theme: 'system',
  applicationMode: 'view',
};

export const rootReducer = createReducer(
  initialState,
  on(DatasetActions.datasetConversionSuccess, (state, { apiKey }) => {
    const newState = { ...state };
    if (apiKey) {
      newState.applicationMode = 'edit';
    }
    return newState;
  }),
);
