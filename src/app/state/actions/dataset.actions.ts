import { createAction, props } from '@ngrx/store';
import {
  JSONStructure,
  Variable,
  VariableForm,
  VariableGroup,
} from '../interface';

export const fetchDataset = createAction(
  '[Dataset] Fetch Dataset',
  props<{ fileID: number; siteURL: string }>()
);
export const fetchDatasetError = createAction(
  '[Dataset] Fetch Dataset Error',
  props<{ error: unknown }>()
);
export const fetchDatasetSuccess = createAction(
  '[Dataset] Fetch Dataset Success',
  props<{ data: string }>()
);

export const datasetConversionPending = createAction(
  '[Dataset] Conversion Pending'
);
export const datasetConversionSuccess = createAction(
  '[Dataset] Conversion Success',
  props<{ dataset: JSONStructure }>()
);
export const datasetConversionError = createAction(
  '[Dataset] Conversion Error',
  props<{ error: string }>()
);
export const setDataset = createAction(
  '[Dataset] Set Dataset',
  props<{ dataset: JSONStructure }>()
);

export const saveVariable = createAction(
  '[Dataset] Variable Changesd',
  props<{
    variableID: string;
    variable: VariableForm;
    groups: string[];
  }>()
);

export const saveBulkVariable = createAction(
  '[Dataset] Multiple Variable Changed',
  props<{ variableID: string[]; variable: VariableForm }>()
);

export const datasetUploadRequest = createAction(
  '[Dataset Upload] Dataset Upload Started'
);
