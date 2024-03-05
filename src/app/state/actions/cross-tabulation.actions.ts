import { createAction, props } from '@ngrx/store';

export const openCrossTabulationTab = createAction(
  '[Cross Tabulation] Open Tab',
);

export const closeCrossTabulationTab = createAction(
  '[Cross Tabulation] Close Tab',
);

export const addVariable = createAction(
  '[Cross Tabulation] Variable Added',
  props<{
    index: number;
    variableID: string;
    variableType: 'rows' | 'columns';
  }>(),
);

export const removeVariable = createAction(
  '[Cross Tabulation] Variable Removed',
  props<{
    index: number;
    variableType: 'rows' | 'columns';
  }>(),
);

export const changeMissingVariables = createAction(
  '[Cross Tabulation] Missing Variables Changed',
  props<{
    index: string;
    missingVariables: string[];
    variableType: 'rows' | 'columns';
  }>(),
);

export const changeVariablePosition = createAction('[Cross Tabulation] Variable Position Changed', props<{ oldIndex: number, newIndex: number  , variableType: 'rows' | 'columns'}>())

export const changeVariableInGivenPosition = createAction('[Cross Tabulation] Variable At Index Changed', props<{ index: number, variableType: 'rows' | 'columns', variableID: string }>())
