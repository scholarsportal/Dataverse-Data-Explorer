import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
import * as fromActions from './actions';

@Injectable()
export class DataFetchEffect {
  // this side effect is called when the fetchDataset action is called,
  // it makes the actual http request and calls success if we get data
  // and error if we do not
  fetchDataset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.fetchDataset),
      switchMap((action) =>
        this.ddi.get(action.fileID, action.siteURL).pipe(
          map(({ variables, groups, citation, varWeights }) => fromActions.datasetLoadSuccess({ variables, groups, citation, varWeights })),
          catchError((error) => of(fromActions.datasetLoadError(error)))
        )
      )
    )
  );

  constructor(private actions$: Actions, private ddi: DdiService) {}

}
