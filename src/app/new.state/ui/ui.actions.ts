import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CrossTabulationUIActions =
  createActionGroup({
    source: 'Cross Tabulation',
    events: {
      // Toggle to Cross Tabulation tab
      'Navigate to Cross Tabulation tab': emptyProps(),
      // Add Variable to Cross Tabulation selection
      'Add to Selection': props<{ variableID: string, orientation?: 'rows' | 'cols' }>(),
      // Remove Variable From Cross Tabulation using variableID
      'Remove Variable Using VariableID': props<{ variableID: string }>(),
      // Remove variable from cross tabulation selection using index
      'Remove Variables Using Index': props<{ index: number }>()
    }
  });

export const VariableTabUIAction = createActionGroup({
  source: 'Variable Tab',
  events: {
    // Toggle to Variable Tab
    'Navigate to Variable Tab': emptyProps(),
    // User has clicked group in sidebar
    'Change Selected Group ID': props<{ groupID: string }>(),
    // User has opened a variables chart or edit modal
    'Change Open Variable': props<{ variableID: string, mode: 'edit' | 'view' }>(),
    // User has selected one or more variables
    'Change Variable Selection Context': props<{ variableIDs: string[], selectedGroup: string }>(),
    // User clicks the import button
    'Open Variable Import Menu': emptyProps(),
    // User clicks the import button again while its open
    // I don't expect users to use this often as the state will switch to close
    // anytime the user switches groups, or presses the all variables button
    'Close Variable Import Menu': emptyProps()
  }
});
