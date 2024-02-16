import { createAction, props } from '@ngrx/store';
import { Variable } from '../interface';

export const addVariable = createAction(
  '[Cross Tabulation] Variable Added',
  props<{
    index: number;
    variableID: string;
    variableType: 'rows' | 'columns';
  }>()
);

export const removeVariable = createAction(
  '[Cross Tabulation] Variable Removed',
  props<{
    index: number;
    variableType: 'rows' | 'columns';
  }>()
);

export const changeMissingVariables = createAction(
  '[Cross Tabulation] Missing Variables Changed',
  props<{
    index: string;
    missingVariables: string[];
    variableType: 'rows' | 'columns';
  }>()
);
