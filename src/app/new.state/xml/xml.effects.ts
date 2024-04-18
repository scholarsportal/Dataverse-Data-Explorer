import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DataverseFetchActions } from './xml.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { DdiService } from '../../services/ddi.service';

@Injectable()
export class XmlEffects {
  private actions$ = inject(Actions);

  // The IDE for some reason won't pick this up, but because this class is
  // registered in main.ts, this effect is fired whenever the corresponding
  // action is called.
  fetchDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.startDDIFetch),
        exhaustMap(({ fileID, siteURL, apiKey }) =>
          ddiService.fetchDatasetFromDataverse(fileID, siteURL).pipe(
            map((data) =>
              DataverseFetchActions.fetchDDISuccess({ data, fileID, siteURL, apiKey })
            ),
            catchError((error) => of(DataverseFetchActions.fetchDDIError(error)))
          )
        )
      );
    }
  );

  uploadDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.startDatasetUpload),
        exhaustMap(({ ddiData, siteURL, fileID, apiKey }) =>
          ddiService
            .uploadDatasetToDataverse(siteURL, fileID, ddiData, apiKey)
            .pipe(
              map((data) => {
                if (data?.error) {
                  return DataverseFetchActions.datasetUploadError({ error: data.error });
                }
                return DataverseFetchActions.datasetUploadSuccess({ response: data });
              }),
              catchError((error) => of(DataverseFetchActions.datasetUploadError({ error })))
            )
        )
      );
    }
  );
}
