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

/**
 * This file contains effects for handling cross tabulation and weight value operations.
 *
 * Key effects and their purposes:
 *
 * 1. startWeightProcessing$
 *    - Triggered when variable info is saved
 *    - Checks if weight variable changed and handles fetching/processing accordingly
 *    - Either fetches missing cross tab values by calling fetchCrossTab$ or starts weight processing directly by calling processNewVariableWeight$
 *
 * 2. fetchCrossTabValues$ (below)
 *    - Fetches cross tab values for variables when they are added to selection or when weight variable changes
 *    - Part of the pipeline that fetches data before weight processing can occur
 *
 * 3. processWeightValues$ (below)
 *    - Processes weight calculations after values are fetched
 *    - Updates variables with new weighted values
 *
 * 4. crossTabSelectionEffects$ (below)
 *    - Manages the cross tab selection state
 *    - Handles adding/removing variables and position changes
 *    - Updates missing categories
 *
 * The effects form a pipeline where data flows from fetching -> processing -> state updates
 */
@Injectable()
export class DatasetEffects {
  private actions$ = inject(Actions);
  // When a user saves a variable, we check if the weight variable has changed.
  // If it has, we check if we already have the cross tab values for the new weight variable.
  // If we do, we start the weight processing. If we don't, we fetch the missing cross tab values and start the weight processing.
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
  // When a user saves multiple variables, we check if the weight variable has changed.
  // If it has, we check if we already have the cross tab values for the new weight variable.
  // If we do, we start the weight processing. If we don't, we fetch the missing cross tab values and start the weight processing.
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
  // When a user changes the weight variable, we fetch the missing cross tab values
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
  // When the app starts, we fetch the cross tab values for all weighted variables
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
  // When a user starts weight selection, we check if the variable already has cross tab values.
  // If it does, we add it to the selection. If it doesn't, we fetch the missing cross tab values (searchWeightVariableCrossTabAndAddToSelection) and add it to the selection.
  startWeightSelection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CrossTabulationUIActions.startVariableWeightSelection),
      mergeMap(({ variableID, crossTabValues }) => {
        const crossTabIDs = Object.keys(crossTabValues);
        if (crossTabIDs.includes(variableID)) {
          return of(
            CrossTabulationUIActions.addWeightVariableToSelection({
              variableID,
              crossTabValues,
            }),
          );
        }
        return of(
          CrossTabulationUIActions.searchWeightVariableCrossTabAndAddToSelection(
            {
              variableID,
              crossTabValues,
            },
          ),
        );
      }),
    ),
  );
  // Called when a the selected weight variable is not in the cross tabulation.
  fetchCrossTabValueAndAddVariableAsCrossTabWeight$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CrossTabulationUIActions.searchWeightVariableCrossTabAndAddToSelection,
      ),
      mergeMap(({ variableID, crossTabValues }) => {
        return this.ddiService
          .fetchCrossTabulationFromVariables(variableID)
          .pipe(
            map((data) =>
              CrossTabulationUIActions.addWeightVariableToSelection({
                variableID,
                crossTabValues: { ...crossTabValues, ...data },
              }),
            ),
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
