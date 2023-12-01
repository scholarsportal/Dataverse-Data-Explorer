import { createAction, props } from '@ngrx/store';

// Notify component on graph creation success
export const variableCreateGraphSuccess = createAction(
  '[Variable] Create Graph Success',
  props<{ id: string; weighted: any; unweighted: any }>()
);
// Throw an error if the calculation cannot be completed for some reason
export const variableCreateGraphError = createAction(
  '[Variable] Create Graph Error',
  props<{ error: any }>()
);

// The modal component will listen for this and launch a modal using the variable data
export const variableSave = createAction(
  '[Variable] Save Variable',
  props<{ id: string, variable: any }>()
);

// The modal component will listen for this and launch a modal using the variable data
export const variableChangeDetail = createAction(
  '[Variable] Change Detail',
  props<{ id: string, variable: any }>()
);
