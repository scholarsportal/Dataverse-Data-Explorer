import { createActionGroup, props } from '@ngrx/store';

export const DatasetActions = createActionGroup({
  source: 'Cross Tabulation Actions',
  events: {
    'Update cross tab values': props<{
      variableID: string;
      data: string[];
      orientation: 'rows' | 'cols' | '';
      index: number;
    }>(),
  },
});
