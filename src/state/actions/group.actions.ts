import { createAction, props  } from "@ngrx/store";

// The table component will dispatch the variable id, to be added to the current list of selected variables
export const variableAddToSelectGroup = createAction(
  '[Variable] Add To Select Group',
  props<{ variableIDs: string[], groupID: string }>()
);

// Remove given variable list from selected group
export const variableRemoveFromSelectGroup = createAction(
  '[Variable] Remove To Select Group',
  props<{ variableIDs: string[], groupID: string }>()
);
// Remove a specified group from the list of groups
export const groupDelete = createAction(
  '[Group] Delete Group',
  props<{ groupID: string }>()
);

// Add a new empty variable group to the list of groups
export const groupCreateNew = createAction('[Group] Create New', props<{ groupID: string, label: string }>());

// Group creation success
export const groupCreateNewError = createAction('[Group Create New] Error');

// View variables in selected group
export const groupSelected = createAction(
  '[Group] Change Selected',
  props<{ groupID: string }>()
);

// A Variable Has recently been changed
export const groupDetailChanged = createAction(
  '[Group] Changed Recently',
  props<{ groupID: string }>()
);

// Add the current list of selected variables to the list of variables in specified group.
export const groupAddSelectedGroup = createAction(
  '[Group] Add Selected Group',
  props<{ groupId: string }>()
);
// Change name property of specified group ID, to newName
export const groupChangeName = createAction(
  '[Group] Change Name',
  props<{ groupID: string; newName: string }>()
);
