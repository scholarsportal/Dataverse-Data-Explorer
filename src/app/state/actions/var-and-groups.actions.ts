import { createAction, props } from '@ngrx/store';
import { JSONStructure } from '../interface';

export const changeSelectedGroup = createAction(
  '[Groups] Change Selected Group',
  props<{ groupID: string | null }>()
);

export const onSelectVariable = createAction(
  '[Variable] Variable added to selection context',
  props<{ variableIDs: string[] }>()
);

export const importNewFile = createAction(
  '[File] New File Conversion started',
  props<{ file: string }>()
);

export const metadataImportSuccess = createAction(
  '[] Metadata import success',
  props<{ data: JSONStructure }>()
);

export const metadataImportFailed = createAction(
  '[] Metadata import failed',
  props<{ error: string }>()
);
