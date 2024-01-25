import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  datasetConversionError,
  datasetConversionSuccess,
  fetchDataset,
  fetchDatasetError,
  fetchDatasetSuccess,
  setDataset,
} from 'src/app/state/actions/dataset.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
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

  massageData$ = createEffect((ddiService: DdiService = inject(DdiService)) => {
    return this.actions$.pipe(
      ofType(datasetConversionSuccess),
      map(({ dataset }) => {
        dataset = ddiService.massageData(dataset);
        return setDataset({ dataset });
      }),
      catchError((error) => of(datasetConversionError({ error })))
    );
  });

  constructor(private actions$: Actions) {}
}
