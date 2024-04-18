/** The user can add values to the cross table calculator at any point.
 * From the Variables Tab, they can hover over a row and add the corresponding
 * value to (either a row or column in) the cross table calculator. From the
 * Variable Tab, when the user selects a value to add to the calculator, the
 * corresponding smart component checks the length of the current row/column
 * list. They then pass that number + 1, along with the variable to an action
 * dispatch: changeVariableInGivenIndex. */
import { createAction, props } from '@ngrx/store';

export const openCrossTabulationTab = createAction(
  '[Cross Tabulation] Open Tab'
);

export const closeCrossTabulationTab = createAction(
  '[Cross Tabulation] Close Tab'
);

export const addVariableToCrossTabulation = createAction(
  '[Cross Tabulation] Variable Added',
  props<{
    variableID: string;
    orientation: 'row' | 'column';
  }>()
);

export const removeVariableFromCrossTabulation = createAction(
  '[Cross Tabulation] Variable Removed',
  props<{
    index: number;
  }>()
);

export const fetchCrossTabValuesAndChangeVariableInGivenPosition = createAction(
  '[Cross Tabulation] Variable At Index Changed',
  props<{
    index: number;
    orientation: 'row' | 'column';
    variableID: string;
  }>()
);

export const changeVariableInGivenPosition = createAction(
  '[Cross Tabulation] Variable At Index Changed',
  props<{
    index: number;
    orientation: 'row' | 'column';
    variableID: string;
  }>()
);

export const changeOrientionInGivenPosition = createAction
('[Cross Tabulation] Change Orientation In Given Position', props<{
  index: number,
  newOrientation: 'row' | 'column'
}>());

export const changeMissingVariables = createAction(
  '[Cross Tabulation] Missing Variables Changed',
  props<{
    variableID: string,
    missing: string[];
  }>()
);

export const getVariableCrossTabulation = createAction(
  '[Cross Tabulation] Add new cross tab value',
  props<{
    variableID: string
  }>()
);

export const variableCrossTabulationDataRetrievedSuccessfully = createAction(
  '[Cross Tabulation] Cross tabulated values retrieved',
  props<{ data: string, variableID: string }>()
);

export const variableCrossTabulationDataRetrievalFailed = createAction(
  '[Cross Tabulation] Cross tabulated values retrieved',
  props<{ error: any }>()
);
