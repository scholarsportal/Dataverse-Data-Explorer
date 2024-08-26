import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DdiService } from '../../services/ddi.service';
import {
  CrossTabulationUIActions,
  VariableTabUIAction,
} from '../ui/ui.actions';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import {
  DataverseFetchActions,
  XmlManipulationActions,
} from '../xml/xml.actions';
import { DatasetActions } from './dataset.actions';
import { changeWeightForSelectedVariables } from './util';

@Injectable()
export class DatasetEffects {
  private actions$ = inject(Actions);
  startWeightProcessing$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(XmlManipulationActions.saveVariableInfo),
      switchMap((props) => {
        const {
          variableID,
          variablesWithCrossTabMetadata,
          allVariables,
          newVariableValue,
        } = props;
        if (
          newVariableValue.assignedWeight !==
          allVariables[variableID]['@_wgt-var']
        ) {
          if (
            !Object.keys(variablesWithCrossTabMetadata).includes(variableID)
          ) {
            return of(
              XmlManipulationActions.weightProcessFetchMissingValuesAndStart({
                allVariables,
                selectedVariables: [variableID],
                weightID: newVariableValue.assignedWeight,
                variablesWithCrossTabMetadata,
              }),
            );
          } else {
            return of(
              XmlManipulationActions.weightProcessStart({
                allVariables,
                selectedVariables: [variableID],
                weightID: newVariableValue.assignedWeight,
                variablesWithCrossTabMetadata,
              }),
            );
          }
        }
        return of(
          XmlManipulationActions.weightProcessSuccess({
            selectedVariables: [],
            allVariables,
            variablesWithCrossTabMetadata,
          }),
        );
      }),
    );
  });
  startBulkWeightProcessing$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(XmlManipulationActions.bulkSaveVariableInfo),
      switchMap((props) => {
        const {
          variableIDs,
          variablesWithCrossTabMetadata,
          allVariables,
          assignedWeight,
        } = props;
        if (assignedWeight) {
          return of(
            XmlManipulationActions.weightProcessFetchMissingValuesAndStart({
              allVariables,
              selectedVariables: variableIDs,
              weightID: assignedWeight,
              variablesWithCrossTabMetadata,
            }),
          );
        }
        return of(
          XmlManipulationActions.weightProcessSuccess({
            selectedVariables: [],
            allVariables,
            variablesWithCrossTabMetadata,
          }),
        );
      }),
    );
  });
  processNewVariableWeight$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XmlManipulationActions.weightProcessStart),
      switchMap((props) => {
        const {
          allVariables,
          selectedVariables,
          weightID,
          variablesWithCrossTabMetadata,
        } = props;

        const newVariables = changeWeightForSelectedVariables(
          allVariables,
          selectedVariables,
          weightID,
          variablesWithCrossTabMetadata,
        );

        return of(
          XmlManipulationActions.weightProcessSuccess({
            selectedVariables: selectedVariables,
            allVariables: newVariables,
            variablesWithCrossTabMetadata,
          }),
        );
      }),
    ),
  );
  fetchCrossTab$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(CrossTabulationUIActions.fetchCrossTabAndAddToSelection),
        switchMap(({ variableID }) =>
          ddiService.fetchCrossTabulationFromVariables(variableID).pipe(
            map((data) =>
              DatasetActions.updateCrossTabValues({ variableID, data }),
            ),
            catchError((error) =>
              of(DataverseFetchActions.fetchDDIError(error)),
            ),
          ),
        ),
      );
    },
  );
  private ddiService: DdiService = inject(DdiService);
  fetchMissingCrossTabValuesAndProcessNewVariableWeight$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XmlManipulationActions.weightProcessFetchMissingValuesAndStart),
      switchMap((props) => {
        const {
          allVariables,
          selectedVariables,
          weightID,
          variablesWithCrossTabMetadata,
        } = props;
        const missingCrossTabMetadata: string[] = [];
        selectedVariables.forEach((variableID) => {
          if (!variablesWithCrossTabMetadata[variableID]) {
            missingCrossTabMetadata.push(variableID);
          }
        });
        if (!variablesWithCrossTabMetadata[weightID] && weightID !== 'remove') {
          missingCrossTabMetadata.push(weightID);
        }
        if (missingCrossTabMetadata.length === 0) {
          return of(
            XmlManipulationActions.weightProcessStart({
              allVariables,
              selectedVariables,
              weightID,
              variablesWithCrossTabMetadata,
            }),
          );
        }

        return this.ddiService
          .fetchCrossTabulationFromVariables(missingCrossTabMetadata.join(','))
          .pipe(
            map((crossTabData) =>
              XmlManipulationActions.weightProcessStart({
                allVariables,
                selectedVariables,
                weightID,
                variablesWithCrossTabMetadata: {
                  ...variablesWithCrossTabMetadata,
                  ...crossTabData,
                },
              }),
            ),
          );
      }),
    ),
  );
  // When a user opens a modal/ any modal, we fetch its cross tab
  processOpenVariable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VariableTabUIAction.changeOpenVariable),
      switchMap(({ variableID }) => {
        return this.ddiService
          .fetchCrossTabulationFromVariables(variableID)
          .pipe(
            map((data) => DataverseFetchActions.weightsFetchSuccess({ data })),
            catchError((error) =>
              of(DataverseFetchActions.weightsFetchError(error)),
            ),
          );
      }),
    ),
  );
  processWeightsOnAppStart = createEffect(() =>
    this.actions$.pipe(
      ofType(DataverseFetchActions.fetchDDISuccess),
      switchMap(({ data }) => {
        const variables = data.codeBook.dataDscr.var;
        const weightedValues: string[] = [];
        variables.map((value) => {
          if (value['@_wgt'] && !weightedValues.includes(value['@_ID'])) {
            weightedValues.push(value['@_ID']);
          }
          if (
            value['@_wgt-var'] &&
            !weightedValues.includes(value['@_wgt-var'])
          ) {
            weightedValues.push(value['@_wgt-var']);
          }
        });
        return this.ddiService
          .fetchCrossTabulationFromVariables(weightedValues.join(','))
          .pipe(
            map((data) => DataverseFetchActions.weightsFetchSuccess({ data })),
            catchError((error) =>
              of(DataverseFetchActions.weightsFetchError(error)),
            ),
          );
      }),
    ),
  );
  startNewWeightSearch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataverseFetchActions.weightSearchStart),
      mergeMap(({ variableIDs }) => {
        return this.ddiService
          .fetchCrossTabulationFromVariables(variableIDs.join(','))
          .pipe(
            map((data) => DataverseFetchActions.weightsFetchSuccess({ data })),
            catchError((error) =>
              of(DataverseFetchActions.weightsFetchError(error)),
            ),
          );
      }),
    ),
  );
  fetchCrossTabAndSetIndex$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CrossTabulationUIActions.fetchCrossTabAndChangeValueInGivenIndex),
      mergeMap((action) => {
        const { variableID, index, orientation } = action;
        return this.ddiService
          .fetchCrossTabulationFromVariables(action.variableID)
          .pipe(
            map((data) =>
              DatasetActions.updateCrossTabValues({
                variableID,
                data,
                orientation,
                index,
              }),
            ),
            catchError((error) =>
              of(DataverseFetchActions.fetchDDIError(error)),
            ),
          );
      }),
    ),
  );
}
