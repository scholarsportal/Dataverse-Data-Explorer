import {createAction, props} from '@ngrx/store';

export const openCrossTabulationTab = createAction(
  '[Cross Tabulation] Open Tab',
);

export const closeCrossTabulationTab = createAction(
  '[Cross Tabulation] Close Tab',
);

export const addVariableToCrossTabulation = createAction(
  '[Cross Tabulation] Variable Added',
  props<{
    variableID: string;
    variableType: 'rows' | 'columns';
  }>(),
);

export const removeVariableFromCrossTabulation = createAction(
  '[Cross Tabulation] Variable Removed',
  props<{
    index: number;
    variableType: 'rows' | 'columns';
  }>(),
);

export const changeMissingVariables = createAction(
  '[Cross Tabulation] Missing Variables Changed',
  props<{
    index: number;
    missingVariables: string[];
    variableType: 'rows' | 'columns';
  }>(),
);

export const changeVariableInGivenPosition = createAction(
  '[Cross Tabulation] Variable At Index Changed',
  props<{
    index: number;
    variableType: 'rows' | 'columns';
    variableID: string;
  }>(),
);

export const getVariablesCrossTabulation = createAction(
  '[Cross Tabulation] New Cross Tabulation Values Requested',
  props<{ siteURL: string; fileID: number; variables: string[] }>(),
);

export const variableCrossTabulationDataRetrievedSuccessfully = createAction(
  '[Cross Tabulation] Cross tabulated values retrieved',
  props<{ data: string }>(),
);

export const variableCrossTabulationDataRetrievalFailed = createAction(
  '[Cross Tabulation] Cross tabulated values retrieved',
  props<{ error: any }>(),
);
