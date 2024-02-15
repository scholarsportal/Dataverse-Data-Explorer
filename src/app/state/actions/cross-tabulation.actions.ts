import { createAction, props } from '@ngrx/store';
import { Variable } from '../interface';

export const addVariableRow = createAction(
  '[Cross Tabulation] Row Added',
  props<{ variableID: string }>()
);

export const removeVariableRow = createAction(
  '[Cross Tabulation] Row Removed',
  props<{ variableID: string }>()
);

export const addVariableColumn = createAction(
  '[Cross Tabulation] Column Added',
  props<{ variableID: string }>()
);

export const removeVariableColumn = createAction(
  '[Cross Tabulation] Column Removed',
  props<{ variableID: string }>()
);
