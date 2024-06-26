import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';
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
        exhaustMap(({ fileID, siteURL, apiKey, metadataID, language }) =>
          ddiService.fetchDatasetFromDataverse(fileID, siteURL, metadataID).pipe(
            map((data) =>
              DataverseFetchActions.fetchDDISuccess({ data, fileID, siteURL, apiKey, metadataID, language })
            ),
            catchError((error) => {
              return of(DataverseFetchActions.fetchDDIError(error));
            })
          )
        )
      );
    }
  );

  decodeAndFetchSignedURL$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.decodeURLAndFetch),
        exhaustMap(({ url }) =>
          ddiService.fetchDecodedURL(url).pipe(
            map((data) =>
              DataverseFetchActions.decodeSuccess({ data })
            ),
            catchError((error) => {
              return of(DataverseFetchActions.fetchDDIError(error));
            })
          )
        )
      );
    }
  );

  querySignedURL$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.decodeSuccess),
        exhaustMap(({ data }) =>
          ddiService.fetchSignedURL(data.data.signedUrls[0].signedUrl).pipe(
            map((xml) => {
                console.log(xml);
                return DataverseFetchActions.fetchDDISuccess({ data: xml, siteURL: '', fileID: 1, language: 'en' });
              }
            ),
            catchError((error) => {
              return of(DataverseFetchActions.fetchDDIError(error));
            })
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
  convertImportedDatasetToXML$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(XmlManipulationActions.startImportMetadata),
        switchMap(({ importedXmlString, variableTemplate }) => {
            const xml = ddiService.XMLtoJSON(importedXmlString);
            return of(XmlManipulationActions.importConversionSuccess({ importDdiData: xml, variableTemplate }));
          }
        )
      );
    }
  );
}

