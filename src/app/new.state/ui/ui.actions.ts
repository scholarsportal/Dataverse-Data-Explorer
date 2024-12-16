import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CrossTabulationUIActions = createActionGroup({
  source: 'Cross Tabulation',
  events: {
    // Toggle to Cross Tabulation tab
    'Navigate to Cross Tabulation tab': emptyProps(),
    // Add Variable to Cross Tabulation selection
    'Add to Selection': props<{
      variableID: string;
      orientation: 'rows' | 'cols' | '';
    }>(),
    // Change value in given index
    'Change Value in Given Index': props<{
      index: number;
      variableID: string;
      orientation: 'rows' | 'cols' | '';
    }>(),
    // Remove Variable From Cross Tabulation using variableID
    'Remove Variable Using VariableID': props<{ variableID: string }>(),
    // Remove variable from cross tabulation selection using index
    'Remove Variables Using Index': props<{ index: number }>(),
    // Change Missing Categories
    'Change Missing Categories': props<{
      variableID: string;
      missing: string[];
    }>(),
    'Start Variable Weight Selection': props<{
      variableID: string;
      crossTabValues: { [variableID: string]: string[] };
    }>(),
    'Search Weight Variable Cross Tab and Add To Selection': props<{
      variableID: string;
      crossTabValues: { [variableID: string]: string[] };
    }>(),
    'Add Weight Variable To Selection': props<{
      variableID: string;
      crossTabValues: { [variableID: string]: string[] };
    }>(),
  },
});

export const VariableTabUIAction = createActionGroup({
  source: 'Variable Tab',
  events: {
    // Toggle to Variable Tab
    'Navigate to Variable Tab': emptyProps(),
    // User has clicked group in sidebar
    'Change Selected Group ID': props<{ groupID: string }>(),
    // User has opened a variables chart or edit modal
    'Change Open Variable': props<{
      mode?: 'edit' | 'view';
      variableID: string;
    }>(),
    // User has selected one or more variables
    'Change Variable Selection Context': props<{
      variableIDs: string[];
      selectedGroup: string;
    }>(),
    // User marks a category (in the View Variable modal) an invalid
    'Change Missing Categories': props<{
      variableID: string;
      categories: string[];
    }>(),
    // User clicks the import button
    'Open Variable Import Menu': emptyProps(),
    // User clicks the import button again while its open
    // I don't expect users to use this often as the state will switch to close
    // anytime the user switches groups, or presses the all variables button
    'Close Variable Import Menu': emptyProps(),
  },
});
