import { createAction, props } from '@ngrx/store';

// User changes modal modal
export const openVariableChangeMode = createAction(
  '[Variable] Change Mode',
  props<{ mode: 'View' | 'Edit' }>()
);

// User clicks next button
export const openVariableSwitchToNext = createAction('[Variable] Next Var');

// User clicks previous button
export const openVariableSwitchToPrev = createAction(
  '[Variable] Previous Variable'
);

// Any time the user makes changes
export const openModalChangesMade = createAction('[State] Changes Made');

// User hits save button
export const variableSave = createAction(
  '[Variable] Save Variable',
  props<{ id: string; variable: any; groups: any }>()
);

// Variable is sanitized and updated
export const variableChangeDetail = createAction(
  '[Variable] Change Detail',
  props<{ id: string; variable: any }>()
);
