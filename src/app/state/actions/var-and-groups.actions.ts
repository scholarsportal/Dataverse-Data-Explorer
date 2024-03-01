import { createAction, props } from '@ngrx/store';
import { JSONStructure, Variable, VariableGroup } from '../interface';

export const importNewFile = createAction(
  '[File] New File Conversion started',
  props<{ file: string }>(),
);

export const changeSelectedGroup = createAction(
  '[Groups] Change Selected Group',
  props<{ groupID: string | null }>(),
);

export const onSelectVariable = createAction(
  '[Variable] Variable added to selection context',
  props<{ variableIDs: string[] }>(),
);

export const addToMissingVariables = createAction(
  '[Variable] Added missing value to variable',
  props<{ [variableID: string]: { [missingValue: string]: string } }>(),
);

export const removeFromMissingVariables = createAction(
  '[Variable] Removed missing value from variable',
  props<{ [variableID: string]: { [missingValue: string]: string } }>(),
);

export const removeSelectedVariablesFromGroup = createAction(
  '[Variable] Variables removed from group',
  props<{ variableIDs: string[]; groupID: string }>(),
);

export const changeImportSettingsSelected = createAction(
  '[Variable] Changed selected import settings',
  props<{ settingName: string; change: boolean }>(),
);

export const groupCreateNew = createAction(
  '[Groups] New Group Created',
  props<{ groupID: string; label: string }>(),
);

export const groupDelete = createAction(
  '[Groups] Group Deleted',
  props<{ groupID: string }>(),
);

export const groupChangeName = createAction(
  '[Groups] Group Renamed',
  props<{ groupID: string; newName: string }>(),
);

export const bulkEditVariables = createAction(
  '[Variables] Bulk Edit Selected Variables',
  props<{ variables: { [id: string]: Variable } }>(),
);

export const bulkChangeGroupsAndWeight = createAction(
  '[Variable] Bulk Edit Groups and Weights',
  props<{
    groups: { [id: string]: VariableGroup };
    variables: { [id: string]: Variable };
  }>(),
);
