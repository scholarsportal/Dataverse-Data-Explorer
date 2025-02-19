import { createActionGroup, emptyProps, props } from '@ngrx/store';
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
    'Clear Dataset Upload Status': emptyProps(),
  },
});
