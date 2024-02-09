import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  datasetConversionError,
  datasetConversionSuccess,
  fetchDataset,
  fetchDatasetError,
  fetchDatasetSuccess,
} from 'src/app/state/actions/dataset.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
import {
  importNewFile,
  metadataImportFailed,
  metadataImportSuccess,
} from './actions/var-and-groups.actions';
import { error } from 'console';

@Injectable()
export class AppEffects {
  fetchDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(fetchDataset),
        exhaustMap(({ fileID, siteURL }) =>
          ddiService.fetchDatasetFromDataverse(fileID, siteURL).pipe(
            map((data) => fetchDatasetSuccess({ data })),
            catchError((error) => of(fetchDatasetError(error)))
          )
        )
      );
    },
    { functional: true }
  );

  convertDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(fetchDatasetSuccess),
        map(({ data }) => {
          const parsedXML = ddiService.XMLtoJSON(data);
          return datasetConversionSuccess({ dataset: parsedXML });
        }),
        catchError((error) => of(datasetConversionError({ error })))
      );
    },
    { functional: true }
  );

  importNewMetadata$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(importNewFile),
        map(({ file }) => {
          const parsedXML = ddiService.XMLtoJSON(file);
          return metadataImportSuccess({ data: parsedXML });
        }),
        catchError((error) => of(metadataImportFailed({ error })))
      );
    }
  );

  constructor(private actions$: Actions) {}
}
