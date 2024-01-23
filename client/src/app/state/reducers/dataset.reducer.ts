import { createReducer, on } from '@ngrx/store';
import * as DatasetActions from '../actions/dataset.actions';
import { JSONStructure } from '../interface';

export interface DatasetState {
  dataset: JSONStructure | null;
  status: 'idle' | 'pending' | 'converting' | 'error' | 'success';
  errorMessage?: string | unknown;
}

export const initialState: DatasetState = {
  dataset: null,
  status: 'idle',
};

export const datasetReducer = createReducer(
  initialState,
  on(
    DatasetActions.setDataset,
    (state, { dataset }): DatasetState => ({
      ...state,
      dataset,
      status: 'idle' as const,
    })
  ),
  on(
    DatasetActions.fetchDataset,
    (state): DatasetState => ({ ...state, status: 'pending' as const })
  ),
  on(
    DatasetActions.fetchDatasetError,
    (state, { error }): DatasetState => ({
      ...state,
      status: 'error' as const,
      errorMessage: error,
    })
  ),
  on(
    DatasetActions.datasetConversionPending,
    (state): DatasetState => ({ ...state, status: 'converting' as const })
  ),
  on(
    DatasetActions.datasetConversionSuccess,
    (state, { dataset }): DatasetState => ({
      ...state,
      dataset,
      status: 'success' as const,
    })
  ),
  on(
    DatasetActions.datasetConversionError,
    (state, { error }): DatasetState => ({
      ...state,
      status: 'error' as const,
      errorMessage: error,
    })
  )
);
