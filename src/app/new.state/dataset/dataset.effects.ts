import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DdiService } from '../../services/ddi.service';
import {
  CrossTabulationUIActions,
  VariableTabUIAction,
} from '../ui/ui.actions';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import {
  DataverseFetchActions,
  XmlManipulationActions,
} from '../xml/xml.actions';
import { DatasetActions } from './dataset.actions';
import { changeWeightForSelectedVariables } from './util';

@Injectable()
export class DatasetEffects {
  private actions$ = inject(Actions);
  startWeightProcessing$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
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
                XmlManipulationActions.fetchMissingValuesAndStartWeightProcess({
                  allVariables,
                  selectedVariables: [variableID],
                  weightID: newVariableValue.assignedWeight,
                  variablesWithCrossTabMetadata,
                }),
              );
            }
            return of(
              XmlManipulationActions.startWeightProcess({
                allVariables,
                selectedVariables: [variableID],
                weightID: newVariableValue.assignedWeight,
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
    },
  );
  startBulkWeightProcessing$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
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
              XmlManipulationActions.fetchMissingValuesAndStartWeightProcess({
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
    },
  );
  processNewVariableWeight$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XmlManipulationActions.startWeightProcess),
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
      ofType(XmlManipulationActions.fetchMissingValuesAndStartWeightProcess),
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
        if (!variablesWithCrossTabMetadata[weightID]) {
          missingCrossTabMetadata.push(weightID);
        }

        return this.ddiService
          .fetchCrossTabulationFromVariables(missingCrossTabMetadata.join(','))
          .pipe(
            map((crossTabData) =>
              XmlManipulationActions.startWeightProcess({
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
            map((data) => DataverseFetchActions.fetchWeightsSuccess({ data })),
            catchError((error) =>
              of(DataverseFetchActions.fetchWeightsError(error)),
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
            tap((data) => console.log(data)),
            map((data) => DataverseFetchActions.fetchWeightsSuccess({ data })),
            catchError((error) =>
              of(DataverseFetchActions.fetchWeightsError(error)),
            ),
          );
      }),
    ),
  );
  startNewWeightSearch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataverseFetchActions.startWeightSearch),
      mergeMap(({ variableIDs }) => {
        return this.ddiService
          .fetchCrossTabulationFromVariables(variableIDs.join(','))
          .pipe(
            map((data) => DataverseFetchActions.fetchWeightsSuccess({ data })),
            catchError((error) =>
              of(DataverseFetchActions.fetchWeightsError(error)),
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
