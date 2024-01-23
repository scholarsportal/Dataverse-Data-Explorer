import { createAction, props } from '@ngrx/store';

export const changeSelectedGroup = createAction(
  '[Groups] Change Selected Group',
  props<{ groupID: string | null }>()
);

export const onSelectVariable = createAction(
  '[Variable] Variable added to selection context',
  props<{ variableIDs: string[] }>()
);
