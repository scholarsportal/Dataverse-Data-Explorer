import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';
import { DdiService } from '../../services/ddi.service';

@Injectable()
export class XmlEffects {
  private actions$ = inject(Actions);

  /**
   * Effect to fetch dataset from Dataverse
   *
   * This effect is triggered by the DataverseFetchActions.fetchDDIStart action.
   * It uses the DdiService to fetch the dataset from Dataverse based on the provided
   * fileID, siteURL, and metadataID. On success, it dispatches the fetchDDISuccess action
   * with the fetched data. On error, it dispatches the fetchDDIError action.
   *
   * @param ddiService - The service used to fetch the dataset
   *
   * @returns An Observable that emits either a fetchDDISuccess or fetchDDIError action based on the fetch result
   */
  fetchDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.fetchDDIStart),
        exhaustMap(({ fileID, siteURL, apiKey, metadataID, language }) =>
          ddiService
            .fetchDatasetFromDataverse(fileID, siteURL, metadataID)
            .pipe(
              map((data) =>
                DataverseFetchActions.fetchDDISuccess({
                  data,
                  fileID,
                  siteURL,
                  apiKey,
                  metadataID,
                  language,
                }),
              ),
              catchError((error) => {
                return of(DataverseFetchActions.fetchDDIError(error));
              }),
            ),
        ),
      );
    },
  );

  decodeSignedURLBeforeFetch$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.decodeURLAndFetch),
        exhaustMap(({ url }) =>
          ddiService.fetchDecodedURL(atob(url)).pipe(
            map((data) => DataverseFetchActions.decodeSuccess({ data })),
            catchError((error) => {
              return of(DataverseFetchActions.fetchDDIError(error));
            }),
          ),
        ),
      );
    },
  );

  fetchSignedURL$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.decodeSuccess),
        exhaustMap(({ data }) =>
          ddiService
            .fetchSignedURL(
              data.data.signedUrls.find(
                (url) => url.name === 'retrieveDataFileDDI',
              )?.signedUrl || '',
            )
            .pipe(
              map((xml) => {
                return DataverseFetchActions.decodeAndFetchDDISuccess({
                  data: xml,
                  apiResponse: data,
                });
              }),
              catchError((error) => {
                return of(DataverseFetchActions.fetchDDIError(error));
              }),
            ),
        ),
      );
    },
  );

  fetchCrossTabValues$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.decodeAndFetchDDISuccess),
        switchMap(({ apiResponse, data, language }) => {
          const urlForCrossTab = apiResponse?.data.signedUrls.find(
            (url) => url.name === 'retrieveDataFile',
          )?.signedUrl;
          if (!urlForCrossTab) {
            throw new Error('No URL found for cross tabulation');
          }
          const variables =
            data.codeBook?.dataDscr?.var.map((variable) => variable['@_ID']) ??
            [];
          return ddiService
            .fetchCrossTabulationFromVariables(variables, urlForCrossTab)
            .pipe(
              map((crossTabData) => {
                return DataverseFetchActions.completeCrossTabFetch({
                  crossTabData,
                  ddiData: data,
                  apiResponse: apiResponse,
                  language,
                });
              }),
              catchError((error) => {
                console.log(error);
                return of(DataverseFetchActions.weightsFetchError({ error }));
              }),
            );
        }),
      );
    },
  );

  uploadDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.datasetUploadStart),
        exhaustMap(({ ddiData, siteURL, fileID, apiKey }) =>
          ddiService
            .uploadDatasetToDataverse(siteURL, fileID, ddiData, apiKey)
            .pipe(
              map((data) => {
                if (data?.error) {
                  return DataverseFetchActions.datasetUploadError({
                    error: data.error,
                  });
                }
                return DataverseFetchActions.datasetUploadSuccess({
                  response: data,
                });
              }),
              catchError((error) =>
                of(DataverseFetchActions.datasetUploadError({ error })),
              ),
            ),
        ),
      );
    },
  );

  secureUploadData$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.startSecureDatasetUpload),
        exhaustMap(({ ddiData, secureUploadURL }) =>
          ddiService
            .uploadWithSecurityDatasetToDataverse(ddiData, secureUploadURL)
            .pipe(
              map((data) => {
                if (data?.error) {
                  return DataverseFetchActions.datasetUploadError({
                    error: data.error,
                  });
                }
                return DataverseFetchActions.datasetUploadSuccess({
                  response: data,
                });
              }),
              catchError((error) =>
                of(DataverseFetchActions.datasetUploadError({ error })),
              ),
            ),
        ),
      );
    },
  );

  convertImportedDatasetToXML$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(XmlManipulationActions.startImportMetadata),
        switchMap(({ importedXmlString, variableTemplate }) => {
          const xml = ddiService.XMLtoJSON(importedXmlString);
          return of(
            XmlManipulationActions.importConversionSuccess({
              importDdiData: xml,
              variableTemplate,
            }),
          );
        }),
      );
    },
  );
}
