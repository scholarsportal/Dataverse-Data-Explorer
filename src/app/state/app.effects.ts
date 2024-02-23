import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  datasetConversionError,
  datasetConversionSuccess,
  datasetUploadFailed,
  datasetUploadRequest,
  datasetUploadStart,
  datasetUploadSuccess,
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

@Injectable()
export class AppEffects {
  fetchDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(fetchDataset),
        exhaustMap(({ fileID, siteURL, apiKey }) =>
          ddiService.fetchDatasetFromDataverse(fileID, siteURL).pipe(
            map((data) =>
              fetchDatasetSuccess({ data, fileID, siteURL, apiKey }),
            ),
            catchError((error) => of(fetchDatasetError(error))),
          ),
        ),
      );
    },
    { functional: true },
  );

  convertDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(fetchDatasetSuccess),
        map(({ data, siteURL, fileID, apiKey }) => {
          const parsedXML = ddiService.XMLtoJSON(data);
          return datasetConversionSuccess({
            dataset: parsedXML,
            siteURL,
            fileID,
            apiKey,
          });
        }),
        catchError((error) => of(datasetConversionError({ error }))),
      );
    },
    { functional: true },
  );

  importNewMetadata$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(importNewFile),
        map(({ file }) => {
          const parsedXML = ddiService.XMLtoJSON(file);
          return metadataImportSuccess({ data: parsedXML });
        }),
        catchError((error) => of(metadataImportFailed({ error }))),
      );
    },
  );

  requestDatasetUpload$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(datasetUploadRequest),
        map(({ dataset, fileID, siteURL, apiKey }) => {
          const parsedJSON = ddiService.JSONtoXML(dataset);
          return datasetUploadStart({
            xml: parsedJSON,
            fileID,
            siteURL,
            apiKey,
          });
        }),
        catchError((error) => of(datasetUploadFailed({ error }))),
      );
    },
  );

  uploadDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(datasetUploadStart),
        exhaustMap(({ xml, siteURL, fileID, apiKey }) =>
          ddiService
            .uploadDatasetToDataverse(siteURL, fileID, xml, apiKey)
            .pipe(
              map((data) => {
                console.log(data);
                return datasetUploadSuccess();
              }),
              catchError((error) => of(datasetUploadFailed({ error }))),
            ),
        ),
      );
    },
  );

  constructor(private actions$: Actions) {}
}
