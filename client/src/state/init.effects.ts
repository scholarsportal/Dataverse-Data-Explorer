import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
import * as fromActions from './actions';
import * as ModalActions from './actions/modal.actions';
import * as DatasetActions from './actions/dataset.actions';
import { SingleVariable, VariableGroups } from './interface';

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

  createVariableGroups = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.datasetLoadSuccess),
      map((action) => {
        const { groups } = action
        let variableGroups: VariableGroups = {}
        Object.keys( action.variables ).map((item: any) => {
            variableGroups[item] = { groups: {} }
        });

        Object.values(groups).map((item: any) => {
          item['@_var'].forEach((variable: string) => {
              variableGroups[variable].groups[item['@_ID']] = item['labl']
          })
        })
        return DatasetActions.datasetVariableGroupsLoaded({ variableGroups })
      })
    ))

  saveVariable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModalActions.variableSave),
      map((action) => {

        const { id, variable } = action;

        return ModalActions.variableChangeDetail({ id, variable })
      }
      )
    ))

  constructor(private actions$: Actions, private ddi: DdiService) {}

  private trimVariable(variable: any, rawVariable: SingleVariable): SingleVariable {

    return rawVariable
  }

}
