import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import { catchError, delay, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { DdiService } from '../../services/ddi.service';
import { DatasetActions } from '../dataset/dataset.actions';
import {
  changeAssignedWeightForMultipleVariables,
  changeGroupsForMultipleVariables,
  changeWeightForSelectedVariables,
  fullyChangeMultipleVariables,
} from './xml.util';

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
        exhaustMap(({ fileID, siteURL, metadataID, language }) =>
          ddiService
            .fetchDatasetFromDataverse(fileID, siteURL, metadataID)
            .pipe(
              map((data) =>
                DataverseFetchActions.fetchCrosstabStart({
                  data,
                  fileID,
                  siteURL,
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

  fetchCrosstab$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(DataverseFetchActions.fetchCrosstabStart),
        switchMap(({ data, fileID, siteURL, metadataID, language }) => {
          const variables =
            data.codeBook?.dataDscr?.var.map((variable) => variable['@_ID']) ??
            [];
          const crossTabUrl = `${siteURL}/api/access/datafile/${fileID}`;
          return ddiService
            .fetchCrossTabulationFromVariables(variables, crossTabUrl)
            .pipe(
              map((crossTabData) =>
                DataverseFetchActions.fetchDDISuccess({
                  data,
                  crossTabData,
                  fileID,
                  siteURL,
                  metadataID,
                  language,
                }),
              ),
              catchError((error) => {
                return of(DataverseFetchActions.fetchDDIError(error));
              }),
            );
        }),
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

  bulkVariableModalSave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(XmlManipulationActions.startBulkVariableModalSave),
      exhaustMap(({ variableIDs, newVariableValue, allVariables }) => {
        const updatedVariables = fullyChangeMultipleVariables(
          Object.values(structuredClone(allVariables)),
          variableIDs,
          newVariableValue,
        );
        return of(
          XmlManipulationActions.bulkSaveVariableModalSuccess({
            updatedVariables,
          }),
        );
      }),
    );
  });

  clearBulkVariableSaveStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(XmlManipulationActions.bulkSaveVariableModalSuccess),
      delay(10000),
      map(() => XmlManipulationActions.clearSaveVariableModalSuccess()),
    );
  });

  bulkSaveWeightAndGroupChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(XmlManipulationActions.bulkSaveWeightAndGroupChange),
      exhaustMap(
        ({
          variableIDs,
          allVariables,
          groupsToUpdate,
          weightToUpdate,
          allGroups,
          crossTabMetadata,
        }) => {
          // Update groups
          const updatedGroups = changeGroupsForMultipleVariables(
            Object.values(structuredClone(allGroups)),
            variableIDs,
            groupsToUpdate,
          );
          // Update assigned weight for variables
          const updatedAssignedWeightVariables =
            changeAssignedWeightForMultipleVariables(
              Object.values(structuredClone(allVariables)),
              variableIDs,
              weightToUpdate,
            );
          // Create object of updated assigned weight variables
          const updatedAssignedWeightVariablesObject = Object.fromEntries(
            updatedAssignedWeightVariables.map((variable) => [
              variable['@_ID'],
              variable,
            ]),
          );
          // Update weights for all variables
          const updateWeightsForAllVariables = changeWeightForSelectedVariables(
            updatedAssignedWeightVariablesObject,
            variableIDs,
            weightToUpdate,
            crossTabMetadata,
          );
          return of(
            XmlManipulationActions.bulkSaveWeightAndGroupChangeSuccess({
              updatedGroups,
              updatedVariables: updateWeightsForAllVariables,
            }),
          );
        },
      ),
    );
  });

  clearBulkVariableStatusSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(XmlManipulationActions.bulkSaveWeightAndGroupChangeSuccess),
      delay(10000),
      map(() => DatasetActions.clearVariableSaveStatus()),
    );
  });

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

  clearDatasetUploadStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataverseFetchActions.datasetUploadSuccess),
      delay(10000),
      map(() => DatasetActions.clearDatasetUploadStatus()),
    );
  });

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
