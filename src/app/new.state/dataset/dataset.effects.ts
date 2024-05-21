import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DdiService } from '../../services/ddi.service';
import { CrossTabulationUIActions } from '../ui/ui.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import { DataverseFetchActions } from '../xml/xml.actions';
import { DatasetActions } from './dataset.actions';

@Injectable()
export class DatasetEffects {
  private actions$ = inject(Actions);

  fetchCrossTabAndSetIndex$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(
          CrossTabulationUIActions.fetchCrossTabAndChangeValueInGivenIndex,
        ),
        switchMap(({ variableID, index, orientation }) =>
          ddiService.fetchCrossTabulationFromVariables(variableID).pipe(
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
          ),
        ),
      );
    },
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
}
