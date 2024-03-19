import { createAction, props } from '@ngrx/store';
import { Variable } from '../interface';

export const openOptionsMenu = createAction('[UI - Options] Open options menu');
export const closeOptionsMenu = createAction(
  '[UI - Options] Close options menu'
);
export const openVariableEditModal = createAction(
  '[UI - Variable Modal] Open edit modal',
  props<{ variableID: string }>()
);
export const openVariableChartModal = createAction(
  '[UI - Variable Modal] Open chart modal',
  props<{ variableID: string }>()
);
export const closeVariableModal = createAction(
  '[UI - Variable Modal] Close modal'
);
export const changeVariableModalMode = createAction(
  '[UI - Variable Modal] Change modal mode',
  props<{ modalMode: 'view' | 'edit' }>()
);
export const changeOpenVariable = createAction(
  '[UI - Variable Modal] Go to Next/Previous Variable',
  props<{ variableID: string }>()
);