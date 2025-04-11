import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, switchMap } from 'rxjs';
import { XmlManipulationActions } from '../xml/xml.actions';

@Injectable()
export class DatasetEffects {
  private actions$ = inject(Actions);
  // TODO: Remove this effect if testing and deployment is successful
  // When a user saves a variable, we check if the weight variable has changed.
  // If it has, we check if we already have the cross tab values for the new weight variable.
  // If we do, we start the weight processing. If we don't, we fetch the missing cross tab values and start the weight processing.
  // startWeightProcessing$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(XmlManipulationActions.saveVariableInfo),
  //     switchMap((props) => {
  //       const {
  //         variableID,
  //         variablesWithCrossTabMetadata,
  //         allVariables,
  //         newVariableValue,
  //       } = props;
  //       if (
  //         newVariableValue.assignedWeight !==
  //         allVariables[variableID]['@_wgt-var']
  //       ) {
  //         return of(
  //           XmlManipulationActions.weightProcessStart({
  //             allVariables,
  //             selectedVariables: [variableID],
  //             weightID: newVariableValue.assignedWeight,
  //             variablesWithCrossTabMetadata,
  //           }),
  //         );
  //       }
  //       return of(
  //         XmlManipulationActions.weightProcessSuccess({
  //           selectedVariables: [],
  //           allVariables,
  //           variablesWithCrossTabMetadata,
  //         }),
  //       );
  //     }),
  //   );
  // });
  // When a user saves multiple variables, we check if the weight variable has changed.
  // If it has, we check if we already have the cross tab values for the new weight variable.
  // If we do, we start the weight processing. If we don't, we fetch the missing cross tab values and start the weight processing.
  // startBulkWeightProcessing$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(XmlManipulationActions.bulkSaveVariableInfo),
  //     switchMap((props) => {
  //       const {
  //         variableIDs,
  //         variablesWithCrossTabMetadata,
  //         allVariables,
  //         assignedWeight,
  //       } = props;
  //       if (assignedWeight) {
  //         return of(
  //           XmlManipulationActions.weightProcessStart({
  //             allVariables,
  //             selectedVariables: variableIDs,
  //             weightID: assignedWeight,
  //             variablesWithCrossTabMetadata,
  //           }),
  //         );
  //       }
  //       return of(
  //         XmlManipulationActions.weightProcessSuccess({
  //           selectedVariables: [],
  //           allVariables,
  //           variablesWithCrossTabMetadata,
  //         }),
  //       );
  //     }),
  //   );
  // });
  // processNewVariableWeight$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(XmlManipulationActions.weightProcessStart),
  //     switchMap((props) => {
  //       const {
  //         allVariables,
  //         selectedVariables,
  //         weightID,
  //         variablesWithCrossTabMetadata,
  //       } = props;
  //       console.log('do we gwt here?', allVariables);
  //       const newVariables = changeWeightForSelectedVariables(
  //         allVariables,
  //         selectedVariables,
  //         weightID,
  //         variablesWithCrossTabMetadata,
  //       );

  //       return of(
  //         XmlManipulationActions.weightProcessSuccess({
  //           selectedVariables: selectedVariables,
  //           allVariables: newVariables,
  //           variablesWithCrossTabMetadata,
  //         }),
  //       );
  //     }),
  //   ),
  // );
}
