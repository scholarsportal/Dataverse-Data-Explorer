// Path: src/app/new.state/dataset/dataset.actions.ts
import { createActionGroup, props } from '@ngrx/store';
import { ParsedCrossTabData } from '../xml/xml.interface';

export const DatasetActions = createActionGroup({
  source: 'Cross Tabulation Actions',
  events: {
    'Update cross tab values': props<{
      variableID: string;
      data: ParsedCrossTabData;
      orientation?: 'rows' | 'cols' | '';
      index?: number;
    }>(),
  },
});
