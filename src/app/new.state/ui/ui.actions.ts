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
    'Change Selected Group ID': props<{ groupID: string }>(),
    'Change Open Variable': props<{ variableID: string, mode: 'edit' | 'view' }>(),
    'Add/Remove Variable Selection Context': props<{ variableIDs: string[], selectedGroup: string }>()
  }
});
