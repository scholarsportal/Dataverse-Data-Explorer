import { createAction, props } from '@ngrx/store';

export const changeSelectedGroup = createAction(
  '[Groups] Change Selected Group',
  props<{ groupID: string }>()
);
