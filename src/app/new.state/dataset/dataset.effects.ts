import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DdiService } from '../../services/ddi.service';
import { CrossTabulationUIActions } from '../ui/ui.actions';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { DataverseFetchActions } from '../xml/xml.actions';
import { DatasetActions } from './dataset.actions';

@Injectable()
export class DatasetEffects {
  private actions$ = inject(Actions);
  fetchCrossTab$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(CrossTabulationUIActions.fetchCrossTabAndAddToSelection),
        switchMap(({ variableID }) =>
          ddiService.fetchCrossTabulationFromVariables(variableID).pipe(
            map((data) =>
              DatasetActions.updateCrossTabValues({ variableID, data })
            ),
            catchError((error) =>
              of(DataverseFetchActions.fetchDDIError(error))
            )
          )
        )
      );
    }
  );

  // fetchCrossTabAndSetIndex$ = createEffect(
  //   (ddiService: DdiService = inject(DdiService)) => {
  //     return this.actions$.pipe(
  //       ofType(
  //         CrossTabulationUIActions.fetchCrossTabAndChangeValueInGivenIndex
  //       ),
  //       exhaustMap(({ variableID, index, orientation }) =>
  //         ddiService.fetchCrossTabulationFromVariables(variableID).pipe(
  //           map((data) =>
  //             DatasetActions.updateCrossTabValues({
  //               variableID,
  //               data,
  //               orientation,
  //               index
  //             })
  //           ),
  //           catchError((error) =>
  //             of(DataverseFetchActions.fetchDDIError(error))
  //           )
  //         )
  //       )
  //     );
  //   }
  // );
  private ddiService: DdiService = inject(DdiService);
  fetchCrossTabAndSetIndex$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CrossTabulationUIActions.fetchCrossTabAndChangeValueInGivenIndex),
      mergeMap((action) => {
          const { variableID, index, orientation } = action;
          return this.ddiService.fetchCrossTabulationFromVariables(action.variableID).pipe(
            map((data) => DatasetActions.updateCrossTabValues({
              variableID,
              data,
              orientation,
              index
            })),
            catchError((error) => of(DataverseFetchActions.fetchDDIError(error)))
          );
        }
      )
    ));
}
